require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const csvPath = path.join(__dirname, '..', 'Lawn_care_example - Working.csv')
const csvData = fs.readFileSync(csvPath, 'utf-8')
const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

function parseCurrency(value) {
  if (!value) return null
  const cleaned = value.replace(/[$,\s]/g, '')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : null
}

function normalizeField(value) {
  return value.replace(/^\s*"|"\s*$/g, '').trim()
}

function parseCustomers() {
  const lines = csvData.split('\n').slice(1)
  const customers = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const fields = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(normalizeField(current))
        current = ''
      } else {
        current += char
      }
    }
    fields.push(normalizeField(current))

    const [
      name,
      address,
      type,
      cost,
      day,
      order,
      distKm,
      distMiles,
      additionalWork,
      additionalWorkCost,
    ] = fields

    if (!name || !address) continue

    // Skip the workshop record from the CSV
    if (type === 'Workshop') continue

    customers.push({
      name,
      address,
      type: type || 'Residential',
      cost: parseCurrency(cost) ?? 0,
      day: day || null,
      route_order: order ? parseInt(order, 10) : null,
      distance_from_shop_km: distKm ? parseFloat(distKm) : null,
      distance_from_shop_miles: distMiles ? parseFloat(distMiles) : null,
      has_additional_work: (additionalWork || '').toLowerCase() === 'yes',
      additional_work_cost: parseCurrency(additionalWorkCost),
    })
  }

  return customers
}

function getUpcomingDate(dayName) {
  const today = new Date()
  const todayIndex = today.getDay()
  const targetIndex = DAY_INDEX[dayName] ?? todayIndex
  const diff = (targetIndex - todayIndex + 7) % 7
  const target = new Date(today)
  target.setDate(today.getDate() + diff)
  return target.toISOString().split('T')[0]
}

function sortForRoute(customers) {
  return [...customers].sort((a, b) => {
    const orderA = a.route_order ?? Number.MAX_SAFE_INTEGER
    const orderB = b.route_order ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return a.name.localeCompare(b.name)
  })
}

async function resetTables(supabase) {
  console.log('Clearing existing routes and customers...')

  const tables = ['route_stops', 'routes', 'customers']
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
      console.error(`Failed to clear ${table}:`, error)
      process.exit(1)
    }
  }
}

async function insertCustomers(supabase, customers) {
  console.log(`Seeding ${customers.length} customers...`)
  const { data, error } = await supabase
    .from('customers')
    .insert(customers)
    .select()

  if (error) {
    console.error('Error seeding customers:', error)
    process.exit(1)
  }

  console.log('Customers inserted.')
  return data
}

async function insertRoutes(supabase, customers) {
  const grouped = customers.reduce((acc, customer) => {
    if (!customer.day || customer.day === 'Workshop') {
      return acc
    }
    if (!acc[customer.day]) {
      acc[customer.day] = []
    }
    acc[customer.day].push(customer)
    return acc
  }, {})

  const orderedDays = Object.keys(grouped).sort(
    (a, b) => (DAY_INDEX[a] ?? 7) - (DAY_INDEX[b] ?? 7)
  )

  let routesCreated = 0
  for (const day of orderedDays) {
    const dayCustomers = sortForRoute(grouped[day])
    if (dayCustomers.length === 0) continue

    const distance = dayCustomers.reduce(
      (sum, customer) => sum + (customer.distance_from_shop_miles || 0),
      0
    )
    const duration = dayCustomers.length * 30 + Math.round(distance * 3)
    const fuelCost = Number((distance * 0.15).toFixed(2))
    const date = getUpcomingDate(day)

    const { data: route, error: routeError } = await supabase
      .from('routes')
      .insert({
        date,
        day_of_week: day,
        status: 'planned',
        total_distance_miles: Number(distance.toFixed(1)),
        total_distance_km: Number((distance * 1.60934).toFixed(1)),
        total_duration_minutes: duration,
        estimated_fuel_cost: fuelCost,
      })
      .select()
      .single()

    if (routeError || !route) {
      console.error(`Error creating ${day} route:`, routeError)
      process.exit(1)
    }

    const stopsPayload = dayCustomers.map((customer, index) => ({
      route_id: route.id,
      customer_id: customer.id,
      stop_order: customer.route_order ?? index + 1,
      status: 'pending',
      estimated_duration_minutes: 30,
    }))

    const { error: stopsError } = await supabase
      .from('route_stops')
      .insert(stopsPayload)

    if (stopsError) {
      console.error(`Error creating route stops for ${day}:`, stopsError)
      process.exit(1)
    }

    routesCreated += 1
    console.log(
      `• ${day}: ${dayCustomers.length} stops | ${distance.toFixed(
        1
      )} mi | $${fuelCost.toFixed(2)} fuel`
    )
  }

  if (routesCreated === 0) {
    console.warn('No routes created. Do your customers have a day assigned?')
  } else {
    console.log(`Routes created: ${routesCreated}`)
  }
}

async function seedDatabase() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
    )
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const customers = parseCustomers()

  if (customers.length === 0) {
    console.error('No customers parsed from CSV. Check the file formatting.')
    process.exit(1)
  }

  await resetTables(supabase)
  const inserted = await insertCustomers(supabase, customers)
  await insertRoutes(supabase, inserted)

  console.log('\nSeed complete!')
}

seedDatabase().catch((error) => {
  console.error('Unexpected error while seeding:', error)
  process.exit(1)
})
