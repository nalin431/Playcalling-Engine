from pathlib import Path
import pandas as pd

##ML libraries
from sklearn.linear_model import LogisticRegression

# Feature set for training (kept here for reproducible experiments).
FEATURE_COLUMNS = [
    "down",
    "ydstogo",
    "yardline_100",
    "goal_to_go",
    "qtr",
    "game_seconds_remaining",
    "half_seconds_remaining",
    "score_differential",
    "posteam_timeouts_remaining",
    "defteam_timeouts_remaining",
    "shotgun",
    "no_huddle",
    "posteam",
    "defteam",
    "home_away",
    "roof",
    "surface",
    "weather",
    "play_type",
    "run_location",
    "run_gap",
    "pass_location",
    "pass_depth_bucket",
    "air_yards",
    "spread_line",
    "total_line",
    "season",
    "week",
]

TARGET_COLUMNS = ["success", "yards_gained"]

DATA_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "pbp_offense_chi_2025.parquet"


##reading in data, getting relevant data, and dropping na
dfraw = pd.read_parquet(DATA_PATH)

dftrain = dfraw[FEATURE_COLUMNS + TARGET_COLUMNS]
dftrain = dftrain.dropna()





##Classifcation model training: scikit-learn logistic regression
##Trained on success of plays




##Linear regression model training: scikit-learn linear regression
##Trained on yards gained of plays


