from pathlib import Path
import pandas as pd

##ML libraries
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, mean_absolute_error, mean_squared_error
from catboost import CatBoostClassifier
from sklearn.base import clone
import joblib

# Feature set for training (kept here for reproducible experiments).
FEATURE_COLUMNS = [
    "down",
    "ydstogo",
    "yardline_100",
    "goal_to_go",
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
    "play_type",
    "run_location",
    "run_gap",
    "run_player",
    "pass_location",
    "pass_depth_bucket",
]

TARGET_COLUMNS = ["success", "yards_gained"]

DATA_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "pbp_offense_chi_2025.parquet"


##reading in data, getting relevant data, and dropping na
dfraw = pd.read_parquet(DATA_PATH)

dftrain = dfraw[FEATURE_COLUMNS + TARGET_COLUMNS + ["game_id"]]

for col in FEATURE_COLUMNS:
    if dftrain[col].dtype == "object":
        dftrain[col] = dftrain[col].fillna("unknown")

dftrain = dftrain.dropna(subset=TARGET_COLUMNS)

# Split features/targets.
X = dftrain[FEATURE_COLUMNS]
y_success = dftrain["success"]
y_yards = dftrain["yards_gained"]

# Split by unique game_id to avoid leakage.
game_ids = dftrain["game_id"].unique()
train_games, validate_games = train_test_split(game_ids, test_size=0.1, random_state=0)

train_mask = dftrain["game_id"].isin(train_games)
val_mask = dftrain["game_id"].isin(validate_games)

X_train = X[train_mask]
y_train_success = y_success[train_mask]
y_train_yards = y_yards[train_mask]


X_val = X[val_mask]
y_val_success = y_success[val_mask]
y_val_yards = y_yards[val_mask]


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


ARTIFACTS_DIR = Path(__file__).resolve().parents[1] / "artifacts"
ARTIFACTS_DIR.mkdir(exist_ok=True)


######
##Classifcation model training: scikit-learn logistic regression
##Trained on success of plays
######
clf = LogisticRegression(max_iter=10000, class_weight="balanced")


clf_pipeline = Pipeline(
    steps=[
        ("preprocess", clone(preprocessor)),
        ("model", clf),
    ]
)
clf_pipeline.fit(X_train, y_train_success)

val_probs = clf_pipeline.predict_proba(X_val)[:, 1]
val_preds = (val_probs >= 0.5).astype(int)

val_acc = accuracy_score(y_val_success, val_preds)
val_auc = roc_auc_score(y_val_success, val_probs)
print(f"Validation accuracy for classification: {val_acc:.3f}")
print(f"Validation AUC for classification: {val_auc:.3f}")

#######################33
cat_features = [X_train.columns.get_loc(col) for col in categorical_cols]

cb_clf = CatBoostClassifier(
    iterations=5000,
    depth=6,
    learning_rate=0.05,
    loss_function="Logloss",
    eval_metric="AUC",
    verbose=200,
    random_state=0,
)
cb_clf.fit(X_train, y_train_success,
    cat_features=cat_features,
    eval_set=(X_val, y_val_success),
    use_best_model=True,
    early_stopping_rounds=200,)
val_probs = cb_clf.predict_proba(X_val)[:, 1]

val_auc = roc_auc_score(y_val_success, val_probs)
print(f"Validation AUC for classification with CatBoost: {val_auc:.3f}")
###############################

#Saving Classifcation to artifcats

joblib.dump(clf_pipeline, ARTIFACTS_DIR / "success_classifier_logisticregression_pipeline.pkl")
joblib.dump(cb_clf, ARTIFACTS_DIR / "success_classifier_CatBoost_pipeline.pkl")



########
##Linear regression model training: scikit-learn linear regression
##Trained on yards gained of plays
###### 
linregr = LinearRegression()

yards_gained_pipeline = Pipeline( 
    steps = [
         ("preprocess", clone(preprocessor)),
        ("model", linregr),
    ]
)

yards_gained_pipeline.fit(X_train, y_train_yards)

val_yards_preds = yards_gained_pipeline.predict(X_val)
val_mae = mean_absolute_error(y_val_yards, val_yards_preds)
val_rmse = (mean_squared_error(y_val_yards, val_yards_preds)) ** .5
print(f"Validation MAE for yards: {val_mae:.3f}")
print(f"Validation RMSE for yards: {val_rmse:.3f}")




joblib.dump(yards_gained_pipeline, ARTIFACTS_DIR / "yards_gained_pipeline.pkl")
