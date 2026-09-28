# Your Project Checklist

A simple, responsive checklist app that tracks your project plan day by day.
Progress is saved automatically in your browser — no backend, no login, no database.

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
Note: only required to update this **todo.json** file.

---

## 1. Clone the project

```bash
git clone https://github.com/<your-username>/<your-repo>.git
```

## 2. Go into the folder

```bash
cd <your-repo>
```


## 3. Copy the PROMPT.md
copy the PROMPT.md file adjust project requirements, time, & priority and use any AI to create the todo.json file
then update that file


## 4. Run it locally

use live server



# Now if you want to make it acessible from anywhere. 
for that use vercel 

## 1. push  this project on the github. 

## 2. 

## Deploying to Vercel

This is a static site, so Vercel hosts it for free and gives you a public URL.
After deploying once, you never need to run the project folder locally again.

### First time only

```bash
npm i -g vercel     # install the Vercel CLI (once)
vercel login        # sign in with GitHub / email
vercel whoami       # confirm which account you're logged in as
```

### Deploy

```bash
vercel deploy
```

Vercel prints a **preview URL** when it finishes. Open it to check the site.

### Push it to production

```bash
vercel --prod
```

This gives you your **permanent public URL** (something like
`https://your-project.vercel.app`). Bookmark it — that's your live app.

