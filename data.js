/**
 * data.js — schedule data for the 4 friends
 * -------------------------------------------------------------
 * This is the ONLY file you should need to touch each semester.
 *
 * Shape:
 *   schedules[name] = [
 *     { day, start, end, class, location },
 *     ...
 *   ]
 *
 *   day      — 3-letter code, Sun–Sat (University of Nizwa runs
 *              Sun–Thu, so Fri/Sat naturally have zero entries
 *              and show up as "free all day").
 *   start/end— 24h "HH:MM", same-day only.
 *   class    — course name shown on cards + grid.
 *   location — building/room string, kept short.
 *
 * To update a semester: replace the arrays below with the new
 * timetable rows. Nothing in app.js or styles.css needs to change.
 * -------------------------------------------------------------
 */

const schedules = {
  "Mohammed": [
    // Chemical & Petroleum Engineering
    { day: "Sun", start: "13:00", end: "13:50", class: "Polymer Science & Technology", location: "Bldg 36 · 36A" },
    { day: "Sun", start: "14:00", end: "15:50", class: "Unit Operations Laboratory", location: "Bldg 27 · 27-15" },
    { day: "Sun", start: "19:00", end: "21:50", class: "Plant Design I", location: "Bldg 36 · 36A" },

    { day: "Mon", start: "09:30", end: "10:45", class: "Equipment Design", location: "Bldg 29 · 29G2" },
    { day: "Mon", start: "14:00", end: "15:50", class: "Reaction Engineering Lab", location: "Bldg 27 · 27-15" },

    { day: "Tue", start: "13:00", end: "13:50", class: "Polymer Science & Technology", location: "Bldg 36 · 36A" },

    { day: "Wed", start: "09:30", end: "10:45", class: "Equipment Design", location: "Bldg 29 · 29G2" },

    { day: "Thu", start: "13:00", end: "13:50", class: "Polymer Science & Technology", location: "Bldg 36 · 36A" },
    { day: "Thu", start: "19:00", end: "21:50", class: "Graduation Project", location: "Bldg 36 · 36A" },
  ],

  "Zayed": [
    // Architecture
    { day: "Sun", start: "12:00", end: "15:50", class: "Architectural Design VI", location: "Bldg 5 · 5C-7" },

    { day: "Mon", start: "08:00", end: "08:50", class: "Entrepreneurship, Creativity & Innovation", location: "Bldg 9 · 9-1" },
    { day: "Mon", start: "11:00", end: "11:50", class: "Advanced Building Technology", location: "Bldg 2 · 2A-2" },

    { day: "Tue", start: "08:00", end: "11:50", class: "Freehand Drawing", location: "Bldg 5 · 5C-5" },
    { day: "Tue", start: "12:00", end: "14:50", class: "Building Information Modeling", location: "Bldg 5 · 5C-1" },

    { day: "Wed", start: "08:00", end: "08:50", class: "Entrepreneurship, Creativity & Innovation", location: "Bldg 9 · 9-1" },
    { day: "Wed", start: "11:00", end: "11:50", class: "Advanced Building Technology", location: "Bldg 2 · 2A-10" },
    { day: "Wed", start: "12:00", end: "15:50", class: "Architectural Design VI", location: "Bldg 5 · 5C-7" },

    { day: "Thu", start: "13:00", end: "14:50", class: "Entrepreneurship Tutorial", location: "Bldg 4 · 4-17" },
  ],

  "Abu-Bakar": [
    // Electrical Engineering
    { day: "Sun", start: "10:00", end: "11:50", class: "Discrete Mathematics", location: "Bldg 34 · 34-5" },
    { day: "Sun", start: "12:00", end: "12:50", class: "Data Structures & Algorithm Design", location: "Bldg 16 · 16A" },
    { day: "Sun", start: "13:00", end: "14:40", class: "Embedded Systems Design", location: "Bldg 2 · 2A-10" },
    { day: "Sun", start: "23:00", end: "23:50", class: "Arabic (Non-Major) – Pre 2", location: "Bldg 28 · 28G" },

    { day: "Mon", start: "08:00", end: "09:15", class: "Digital Control", location: "Bldg 27 · 27-9" },
    { day: "Mon", start: "12:30", end: "13:45", class: "Computer Networks", location: "Bldg 2 · 2A-10" },
    { day: "Mon", start: "14:00", end: "15:15", class: "Measurements & Instrumentation", location: "Bldg 36 · 36B" },
    { day: "Mon", start: "23:00", end: "23:50", class: "Arabic (Non-Major) – Pre 2", location: "Bldg 28 · 28G" },

    { day: "Tue", start: "10:00", end: "11:50", class: "Discrete Mathematics Lab", location: "Bldg 4 · 4-4" },
    { day: "Tue", start: "12:00", end: "12:50", class: "Data Structures & Algorithm Design", location: "Bldg 16 · 16A" },
    { day: "Tue", start: "13:00", end: "13:50", class: "Embedded Systems Design", location: "Bldg 2 · 2A-10" },
    { day: "Tue", start: "23:00", end: "23:50", class: "Arabic (Non-Major) – Pre 2", location: "Bldg 28 · 28G" },

    { day: "Wed", start: "08:00", end: "09:15", class: "Digital Control", location: "Bldg 27 · 27-9" },
    { day: "Wed", start: "10:00", end: "11:50", class: "Data Structures & Algorithms Lab", location: "Bldg 8 · 8-5" },
    { day: "Wed", start: "12:30", end: "13:45", class: "Computer Networks", location: "Bldg 2 · 2A-10" },
    { day: "Wed", start: "14:00", end: "15:15", class: "Measurements & Instrumentation", location: "Bldg 36 · 36B" },
  ],

  "Danial": [
    // Computer Science / Physics
    { day: "Sun", start: "09:00", end: "09:50", class: "Digital Logic Design", location: "Bldg 16 · 16A" },
    { day: "Sun", start: "10:00", end: "10:50", class: "Database Concepts & Applications", location: "Bldg 15 · 15C" },
    { day: "Sun", start: "11:00", end: "11:50", class: "English Language II", location: "Bldg 4 · 4-23" },
    { day: "Sun", start: "12:00", end: "12:50", class: "General Physics I", location: "Bldg 9 · 9-1" },
    { day: "Sun", start: "15:00", end: "15:50", class: "Special Topics in Computer Sciences", location: "Bldg 16 · 16C" },

    { day: "Mon", start: "08:00", end: "09:50", class: "Special Topics in CS – Lab/Tutorial", location: "Bldg 8 · 8-6" },
    { day: "Mon", start: "10:00", end: "11:50", class: "Digital Logic Design Lab", location: "Bldg 16 · 16A" },

    { day: "Tue", start: "09:00", end: "09:50", class: "Digital Logic Design", location: "Bldg 16 · 16A" },
    { day: "Tue", start: "10:00", end: "10:50", class: "Database Concepts & Applications", location: "Bldg 4 · 4-18" },
    { day: "Tue", start: "11:00", end: "11:50", class: "English Language II", location: "Bldg 4 · 4-23" },
    { day: "Tue", start: "12:00", end: "12:50", class: "General Physics I", location: "Bldg 4 · 4-4" },
    { day: "Tue", start: "15:00", end: "15:50", class: "Special Topics in Computer Sciences", location: "Bldg 17 · 17A" },

    { day: "Wed", start: "12:00", end: "13:50", class: "General Physics I Lab", location: "Bldg 9 · 9-5" },
    { day: "Wed", start: "14:00", end: "15:50", class: "Database Concepts & Applications Lab", location: "Bldg 5 · 5B-10" },

    { day: "Thu", start: "11:00", end: "11:50", class: "English Language II", location: "Bldg 4 · 4-23" },
    { day: "Thu", start: "12:00", end: "12:50", class: "General Physics I", location: "Bldg 4 · 4-4" },
  ],
};

// Small identity accent per person — used only for avatar initials and the
// schedule grid's lane color, never for status (free/in-class stays green/red
// everywhere so meaning never depends on which friend it is).
const peopleMeta = {
  "Mohammed": { color: "#f0a93a" },
  "Zayed": { color: "#5ec8b8" },
  "Abu-Bakar": { color: "#7d8fe0" },
  "Danial": { color: "#e27d8e" },
};

// Keep insertion order stable across the app.
const peopleOrder = ["Mohammed", "Zayed", "Abu-Bakar", "Danial"];
