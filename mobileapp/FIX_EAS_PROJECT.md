# Fix EAS Project Configuration

The EAS project was linked to "servicecare" but we changed the slug to "cashbook". Here's how to fix it:

## Solution: Create New EAS Project

1. **I've already removed the old projectId from app.json**

2. **Run this command to create a new project:**
   ```bash
   cd mobileapp
   eas project:init
   ```

3. **When prompted:**
   - It will ask: "Would you like to create a project for @mrahulbhat/cashbook?"
   - Type: **y** and press Enter
   - It will create a new project and add the projectId to your app.json

4. **Then you can build:**
   ```bash
   eas build --platform ios --profile preview
   # or
   eas build --platform android --profile preview
   ```

## Alternative: Use Existing Project (if you want to keep servicecare)

If you prefer to keep using the existing project, change the slug back to "servicecare" in app.json:

```json
"slug": "servicecare"
```

Then the build should work without creating a new project.

