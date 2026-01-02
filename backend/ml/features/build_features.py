import nflreadpy as nfl
import pandas as pd
import numpy as np
import pyarrow as pa

pbp = nfl.load_pbp()

pbp_pandas = pbp.to_pandas()

# Filter to 2025 Bears offensive plays early to keep memory manageable.
pbp_2025 = pbp_pandas[pbp_pandas['season'] == 2025]
pbp_bears = pbp_2025[pbp_2025['posteam'] == 'CHI']
pbp_offense = pbp_bears[pbp_bears['play_type'].isin(['run', 'pass'])]



print(pbp_offense.head())
print(pbp_offense.shape)
print(pbp_offense["game_id"].nunique())