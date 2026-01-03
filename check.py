from pathlib import Path 
t=Path('src/types/database.types.ts').read_text(encoding='utf-8') 
print('start_time' in t, 'end_time' in t) 
