import nflreadpy as nfl
import pandas as pd
import numpy as np
import pyarrow as pa
from pathlib import Path

pbp = nfl.load_pbp(seasons=[2025])

pbp_pandas = pbp.to_pandas()

# Filter to 2025 Bears offensive plays early to keep memory manageable.
pbp_2025 = pbp_pandas[pbp_pandas['season'] == 2025]
pbp_bears = pbp_2025[pbp_2025['posteam'] == 'CHI']
pbp_offense_raw = pbp_bears[pbp_bears['play_type'].isin(['run', 'pass'])]
##all of bears offensive plays in pbp_offense_raw (pandas dataframe); important to note we're not training on penalties/no play

pbp_offense = pbp_offense_raw.copy()

# Drop rows with missing core fields and filter out 0 ydstogo plays
pbp_offense = pbp_offense.dropna(subset=['down', 'ydstogo', 'yardline_100', 'yards_gained'])
pbp_offense = pbp_offense[pbp_offense["ydstogo"] > 0]

# Success definition: 40/60/100 rule by down.
success_conditions = [
    (pbp_offense['down'] == 1) & (pbp_offense['yards_gained'] >= 0.4 * pbp_offense['ydstogo']),
    (pbp_offense['down'] == 2) & (pbp_offense['yards_gained'] >= 0.6 * pbp_offense['ydstogo']),
    (pbp_offense['down'] >= 3) & (pbp_offense['yards_gained'] >= pbp_offense['ydstogo']),
]
pbp_offense['success'] = np.select(success_conditions, [1, 1, 1], default=0)



# pass_depth_bucket
if 'air_yards' in pbp_offense.columns:
    pbp_offense["pass_depth_bucket"] = "not_pass"  

    is_pass = pbp_offense["play_type"] == "pass"

    conditions = [
        pbp_offense.loc[is_pass, "air_yards"].isna(),
        pbp_offense.loc[is_pass, "air_yards"] <= 0,
        (pbp_offense.loc[is_pass, "air_yards"] > 0) & (pbp_offense.loc[is_pass, "air_yards"] <= 5),
        (pbp_offense.loc[is_pass, "air_yards"] > 5) & (pbp_offense.loc[is_pass, "air_yards"] <= 15),
        pbp_offense.loc[is_pass, "air_yards"] > 15,
    ]
    choices = ["no_target", "behind_los", "short", "medium", "deep"]

    pbp_offense.loc[is_pass, "pass_depth_bucket"] = np.select(conditions, choices, default="unknown")


else:
    pbp_offense["pass_depth_bucket"] = "unknown"




#####
###Saving data
####
ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)

parquet_path = ARTIFACTS_DIR / "pbp_offense_chi_2025.parquet"
csv_path = ARTIFACTS_DIR / "pbp_offense_chi_2025.csv"

pbp_offense.to_parquet(parquet_path, index=False)
pbp_offense.to_csv(csv_path, index=False)







print("Saved parquet to:", parquet_path.resolve())
print("Saved csv to:", csv_path.resolve())

print(pbp_offense.head())
print(pbp_offense.shape)
print(pbp_offense["game_id"].nunique())
print(type(pbp_offense))
