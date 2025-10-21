# V2

## New Features

### Frequency Options
- Daily
- Every 2 Days
- Weekly
- Bi-weekly (Every 2 weeks)
- Monthly

### Timezone Support
- Automatic timezone detection from browser
- Manual timezone override option
- Timezone settings in both PWA and Discord bot
- Accurate reminder times based on user's timezone

### Medication Details
- **Dose** (Optional): e.g., "10mg", "2 tablets"
- **Amount** (Optional): e.g., "1 pill", "5ml"
- **Instructions** (Optional): e.g., "Take with food"

### Edit System
- Edit all medication properties except name
- Update time, frequency, dose, amount, and instructions
- Available in both PWA and Discord bot (`/editmed` command)

### New Discord Commands
- `/timezone` - Set your timezone for accurate reminders
- `/editmed` - Edit existing medications without deleting

### Technical Improvements
- Better frequency logic for non-daily medications
- Proper timezone conversion (UTC storage, local display)
- Enhanced medication tracking with `lastTaken` and `nextDue` fields
- Improved reminder system for different frequencies

## Breaking Changes
- Users need to recreate their medications with the new frequency field
- V1 data is not automatically migrated to V2