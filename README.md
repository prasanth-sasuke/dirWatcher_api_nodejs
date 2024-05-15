## dirWatcher_api_nodejs

A directory watcher is a mechanism provided by various libraries that allows your application to monitor changes in a specific directory and react to those changes in real-time. This feature is particularly useful for tasks such as watching for new files, modifications to existing files, or deletions within a directory.

### Predefined

1. Node.js version: v20.10.0
2. Postman version: 10
3. Code editor (e.g., Visual Studio Code)
4. MySQL server (e.g., MySQL Workbench, phpMyAdmin)

### Project Setup Instructions

#### MySQL Server

**Step 1:** Open the `db.sql` file located inside the `Dependency` folder.

**Step 2:** Import the schema into your MySQL server.

#### Postman

**Step 1:** Import the `Mission_lumel.postman_collection.json` file from the `Dependency` folder into Postman.

#### Visual Studio Code Setup

**Step 1:** Fork and clone this repository.

```bash
git clone https://github.com/prasanth-sasuke/dirWatcher_api_nodejs.git
```

**Step 2:** Install project dependencies.
```
npm install
```

**Step 3:** start the server

```
npm start
```

# Running the Project

Step 1: In Postman, navigate to the `config -> config` section.

Step 2: Schedule a configuration by [saving the config](http://localhost:4000/dev/saveConfig) with the provided payload.

Step 3: Add or remove files in the scheduled directory to monitor changes.

Step 4: Use the GET request [monitor](http://localhost:4000/dev/monitor?directory=D:/Assessment/lumel/frontend) to retrieve status, magic_string count, created_at, updated_at, and deleted_at information.

Note: Additionally, `dirWatcher -> config` an API call is provided for creating a file in the scheduled directory: [createFile](http://localhost:4000/dev/createDir).

This markdown file serves as documentation for the `dirWatcher_api_nodejs` project. Please review it for any further updates or corrections.













