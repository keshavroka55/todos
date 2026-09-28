[📄 Prompt](./PROMPT.md) • [🤝 Contributing](./CONTRIBUTING.md)
# Your Project Checklist

A simple, responsive checklist app that tracks your project plan day by day.
Progress is saved automatically in your browser.

---
## Why You Need to Use It

To avoid last-minute rushing and ensure you have enough time to receive feedback from your supervisor.

## To build your own with your own style, follow these steps

### 1. Clone the project

```bash
git clone https://github.com/keshavroka55/todos.git
```

### 2. Go into the folder

```bash
cd todos
```

### 3. Create your own todo.json

Open `PROMPT.md`, adjust the project requirements, time, and priority.  
Use any AI to generate a `todo.json` file.  
Replace the existing `data/todo.json` with the new one.

### 4. Run it locally

Open the folder in VS Code and use the Live Server extension.  
Right-click `index.html` → **Open with Live Server**.

---

## Make it accessible from anywhere

Use Vercel — free hosting, permanent public URL.

### 1. Push this project to GitHub

Use your usual git commands to push the project.

### 2. Deploying to Vercel

This is a static site, so Vercel hosts it for free and gives you a public URL.
After deploying once, you never need to run the project folder locally again.

**First time only**

```bash
npm i -g vercel     # install the Vercel CLI (once)
vercel login        # sign in with GitHub / email (skip if already logged in)
vercel whoami       # confirm which account you're logged in as
```

**Deploy**

```bash
vercel deploy
```

Vercel prints a **preview URL** when it finishes. Open it to check the site.
e.g: https://todos-delta-kohl.vercel.app/

You can also check on [vercel.com](https://vercel.com).

**Push to production**

```bash
vercel --prod
```

This gives you your permanent public URL.

**Updating later or Contribute**

```bash
git add .
git commit -m "update"
git push

vercel --prod
```

---

## Folder structure

```
.
├── index.html
├── data/
│   └── todo.json        ← all days and tasks data
├── css/
│   └── style.css
├── js/
│   └── script.js
├── prompt.md
└── README.md
```

**Note:** Only required to update this **todo.json** file.

