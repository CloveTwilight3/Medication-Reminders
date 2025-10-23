# V1

Will be a basic daily reminder for your medicatons, nothing too flashy just yet.

Works only in UTC at the moment!

JSON Data Storage

# V2

Will include other alert types, daily, 2-daily, weekly, bi-weekly, monthly etc.

Allow to manually setup timezone so we can convert to UTC.

Add dosing info and/or other medication info.

Potentially could be using manual input on how per how many days.

Add medication edit system, so you can edit your meds if there ever is any changes to doseages, or how you take it.

# PTB V1.0.0

Adds WebSocket data to allow live dashboard data

Tighten security to use a SQL storage server

Moving commands to use subcommands, 

```js
/addmed => /med add

/listmed => /med list

/editmed => /med edit

```

Add new `/dashboard` command to allow you to open the webdash.

# PTB V1.0.1

Added `/support` command to invite to the support server

# PTB V1.0.2

Fixed images on website, fixed broken OAuth webflow. 