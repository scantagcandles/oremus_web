# Oremus Database Schema Documentation

Generated on: June 21, 2025

## Tables

### users

| Column     | Type   | Nullable | Constraints | Description                          |
| ---------- | ------ | -------- | ----------- | ------------------------------------ |
| id         | string | No       | PK          |                                      |
| email      | string | No       |             | User's email address                 |
| created_at | string | No       |             | Timestamp when user was created      |
| updated_at | string | No       |             | Timestamp when user was last updated |
| name       | string | Yes      |             | User's full name                     |
| avatar_url | string | Yes      |             | URL to user's avatar image           |

### candles

| Column     | Type    | Nullable | Constraints    | Description                              |
| ---------- | ------- | -------- | -------------- | ---------------------------------------- |
| id         | string  | No       | PK             |                                          |
| user_id    | string  | No       | FK -> users.id | Reference to user who created the candle |
| intention  | string  | No       |                | Prayer intention for the candle          |
| expires_at | string  | No       |                | When the virtual candle expires          |
| created_at | string  | No       |                | When the candle was created              |
| nfc_id     | string  | Yes      |                | Optional NFC tag ID for physical candles |
| is_active  | boolean | No       |                | Whether the candle is currently active   |

### masses

| Column         | Type        | Nullable | Constraints    | Description                                   |
| -------------- | ----------- | -------- | -------------- | --------------------------------------------- |
| id             | string      | No       | PK             |                                               |
| user_id        | string      | No       | FK -> users.id | Reference to user who requested the mass      |
| intention      | string      | No       |                | Intention for the mass                        |
| scheduled_date | string      | No       |                | When the mass is scheduled                    |
| created_at     | string      | No       |                | When the mass request was created             |
| type           | mass_type   | No       |                | Type of mass (regular, requiem, thanksgiving) |
| status         | mass_status | No       |                | Current status of the mass                    |
| priest_notes   | string      | Yes      |                | Private notes for the priest                  |

**Relationships:**

- masses_user_id_fkey: masses.user_id -> users.id

### audio_tracks

| Column               | Type       | Nullable | Constraints | Description                                |
| -------------------- | ---------- | -------- | ----------- | ------------------------------------------ |
| id                   | string     | No       | PK          |                                            |
| title                | string     | No       |             | Title of the audio track                   |
| url                  | string     | No       |             | URL to the audio file                      |
| duration             | number     | No       |             | Duration in seconds                        |
| type                 | track_type | No       |             | Type of track (prayer, course, odb, mass)  |
| language             | string     | No       |             | Language of the audio                      |
| created_at           | string     | No       |             | When the track was added                   |
| is_premium           | boolean    | No       |             | Whether this requires premium subscription |
| transcript_url       | string     | Yes      |             | Optional URL to transcript                 |
| interactive_segments | JSONB      | Yes      |             | Interactive segments data                  |
| chapters             | JSONB      | Yes      |             | Chapter markers                            |

### user_progress

| Column        | Type    | Nullable | Constraints           | Description                       |
| ------------- | ------- | -------- | --------------------- | --------------------------------- |
| id            | string  | No       | PK                    |                                   |
| user_id       | string  | No       | FK -> users.id        | Reference to user                 |
| track_id      | string  | No       | FK -> audio_tracks.id | Reference to audio track          |
| progress      | number  | No       |                       | Progress percentage (0-100)       |
| completed     | boolean | No       |                       | Whether user completed this track |
| created_at    | string  | No       |                       | When progress tracking started    |
| updated_at    | string  | No       |                       | When progress was last updated    |
| last_position | number  | No       |                       | Last playback position in seconds |
| notes         | string  | Yes      |                       | User's personal notes             |

**Relationships:**

- user_progress_user_id_fkey: user_progress.user_id -> users.id
- user_progress_track_id_fkey: user_progress.track_id -> audio_tracks.id

## Enums

### mass_type

Possible values: `regular`, `requiem`, `thanksgiving`

### mass_status

Possible values: `pending`, `confirmed`, `completed`, `cancelled`

### track_type

Possible values: `prayer`, `course`, `odb`, `mass`

### segment_type

Possible values: `listen`, `respond`, `meditate`

### mass_intention_status

Possible values: `pending_payment`, `paid`, `rejected`, `cancelled`, `completed`, `scheduled`, `payment_failed`
