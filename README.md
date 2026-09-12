# 75 Hard Showdown

Three friends. One trail. 75 days. No logins — just three private links.

## How it works

- Everyone starts at Basecamp on **September 18, 2026** and races toward the
  Summit at day 75.
- Each player picks their **own list of daily activities** before the
  challenge starts (e.g. two workouts, a diet rule, water, reading, a
  photo). That list **locks the moment the challenge starts** and can't be
  changed for the full 75 days.
- Finish every activity on your list in a day and your token moves one step
  up the trail. Miss even one activity and that day doesn't count.
- Every completed calendar week (7 days) gets scored. **More than 2
  incomplete days in that week and you get pushed back** — your token
  retreats 7 steps and you lose one of your **3 lives**.
- Lose all 3 lives and you're **eliminated** — out of the race, but you can
  still watch the other two finish.
- A daily reminder goes out over WhatsApp to anyone who hasn't checked off
  today's list yet.

There's a public leaderboard (`/showdown`) that all three of you can see, and
one private link each (`/check-in/<your-token>`) where you check off your own
day and set up your list before the start date.

## 1. Deploy it

Push this folder to a GitHub repo, then click:

```
https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO&env=UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN,CRON_SECRET,PERSON1_NAME,PERSON1_TOKEN,PERSON1_PHONE,PERSON1_CALLMEBOT_APIKEY,PERSON2_NAME,PERSON2_TOKEN,PERSON2_PHONE,PERSON2_CALLMEBOT_APIKEY,PERSON3_NAME,PERSON3_TOKEN,PERSON3_PHONE,PERSON3_CALLMEBOT_APIKEY
```

(Swap in your own GitHub username/repo, or turn that into a
`[![Deploy with Vercel](https://vercel.com/button)](...)` badge in this
README.)

**For the two `UPSTASH_REDIS_REST_*` fields**, you won't have real values yet
on your very first deploy — type anything as a placeholder (e.g. `temp`) so
the form lets you continue. Right after the first deploy finishes:

1. Open your project on vercel.com → **Storage** tab.
2. Add the **Redis** integration (Upstash) — a couple of clicks, no signup
   needed outside Vercel.
3. It fills in the real `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
   for you automatically and redeploys. That's your database, done.

## 2. Fill in the three players

For each person, decide on:

- **`PERSONn_NAME`** — whatever you want shown on the leaderboard.
- **`PERSONn_TOKEN`** — any random unguessable string, e.g. run
  `openssl rand -hex 8` in a terminal, or mash the keyboard. This becomes
  their private link: `https://your-app.vercel.app/check-in/<token>`.
  Don't post this link anywhere public — DM it to them directly.
- **`PERSONn_PHONE`** and **`PERSONn_CALLMEBOT_APIKEY`** — see below.

## 3. Set up WhatsApp reminders (CallMeBot)

CallMeBot is a free API made for exactly this — personal reminders to a
small group. It's an unofficial hobby project, not something enterprise-grade,
but it's the fastest way to get real WhatsApp messages without a business
account. Each person does this once, themselves, from their own phone:

1. Save the CallMeBot phone number as a contact (get the current number from
   [callmebot.com/whatsapp](https://www.callmebot.com/whatsapp/) — it
   changes occasionally).
2. WhatsApp that contact the exact phrase: `I allow callmebot to send me
   messages`.
3. Within a couple of minutes you'll get a reply with your API key.
4. Put your phone number (with country code, e.g. `+15551234567`) in
   `PERSONn_PHONE` and the key you got back in `PERSONn_CALLMEBOT_APIKEY`.

If someone skips this, they just won't get WhatsApp reminders — everything
else in the app still works fine for them.

## 4. Set `CRON_SECRET`

Any random string (e.g. `openssl rand -hex 16`). Vercel automatically sends
it back as the `Authorization` header when it triggers the daily reminder
job, so the cron endpoint can tell a real trigger from a random request.

## 5. Share the links

- Public leaderboard, share with everyone: `https://your-app.vercel.app/showdown`
- Private check-in links, DM one to each person:
  `https://your-app.vercel.app/check-in/<their-token>`

Before September 18, each person opens their own link and locks in their
activity list. From the 18th onward, that same link becomes their daily
checklist.

## Notes on the daily reminder job

- Vercel's free (Hobby) plan allows cron jobs to run **once a day**, at
  roughly (not exactly) the hour you set — `vercel.json` is set to 18:00 UTC.
  Change that if you want reminders at a different time.
- The same job also scores the previous week for the pushback rule, so
  nothing extra needs to run.

## Local development

```
npm install
npm run dev
```

You'll need real `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
values in a `.env.local` file (copy `.env.example`) for anything that reads
or writes data to actually work locally.
# 75Hard
