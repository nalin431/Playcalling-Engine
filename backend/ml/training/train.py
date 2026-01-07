from pathlib import Path
import pandas as pd

##ML libraries
from sklearn.linear_model import LogisticRegression
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib

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
    "posteam_type",
    "roof",
    "surface",
    "weather",
    "play_type",
    "run_location",
    "run_gap",
    "pass_location",
    "pass_depth_bucket",
    "season",
    "week",
]

TARGET_COLUMNS = ["success", "yards_gained"]

DATA_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "pbp_offense_chi_2025.parquet"


##reading in data, getting relevant data, and dropping na
dfraw = pd.read_parquet(DATA_PATH)

dftrain = dfraw[FEATURE_COLUMNS + TARGET_COLUMNS + ["game_id"]]
dftrain = dftrain.dropna()

# Split features/targets.
X = dftrain[FEATURE_COLUMNS]
y_success = dftrain["success"]

# Split by unique game_id to avoid leakage.
game_ids = dftrain["game_id"].unique()
train_games, validate_games = train_test_split(game_ids, test_size=0.1, random_state=0)

train_mask = dftrain["game_id"].isin(train_games)
val_mask = dftrain["game_id"].isin(validate_games)

X_train = X[train_mask]
y_train = y_success[train_mask]

X_val = X[val_mask]
y_val = y_success[val_mask]


# Identify categorical vs numeric columns.
categorical_cols = [col for col in FEATURE_COLUMNS if X[col].dtype == "object"]
numeric_cols = [col for col in FEATURE_COLUMNS if col not in categorical_cols]

# Preprocessing: one-hot for categoricals, standardize numeric features.
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
        ("num", StandardScaler(), numeric_cols),
    ],
    remainder="drop",
)

# Fit preprocessing on train, apply to validation.
X_train_processed = preprocessor.fit_transform(X_train)
X_val_processed = preprocessor.transform(X_val)

##Classifcation model training: scikit-learn logistic regression
##Trained on success of plays
clf = LogisticRegression(max_iter=1000)
clf.fit(X_train_processed, y_train)

val_probs = clf.predict_proba(X_val_processed)[:, 1]
val_preds = (val_probs >= 0.5).astype(int)

val_acc = accuracy_score(y_val, val_preds)
val_auc = roc_auc_score(y_val, val_probs)
print(f"Validation accuracy: {val_acc:.3f}")
print(f"Validation AUC: {val_auc:.3f}")

#Saving to artifcats
ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)

joblib.dump(clf, ARTIFACTS_DIR / "success_classifier.pkl")

##Linear regression model training: scikit-learn linear regression
##Trained on yards gained of plays
