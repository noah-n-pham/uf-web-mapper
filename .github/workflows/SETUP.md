# GitHub Actions Setup Guide

This guide walks you through setting up automated weekly crawls using GitHub Actions.

## Prerequisites

✅ Repository pushed to GitHub  
✅ Crawler tested locally and working  
✅ Valid contact email for crawler User-Agent

---

## Step 1: Configure Repository Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following:
   - **Name**: `CRAWLER_CONTACT_EMAIL`
   - **Value**: Your valid, monitored email address (e.g., `your-email@ufl.edu`)
5. Click **Add secret**

---

## Step 2: Enable Workflow Permissions

The workflow needs permission to commit and push the updated `data.json` file.

1. Go to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests** (optional)
5. Click **Save**

---

## Step 3: Activate the Workflow

1. Rename the template file:
   ```bash
   mv .github/workflows/crawler.yml.template .github/workflows/crawler.yml
   ```

2. Edit `crawler.yml` and uncomment the schedule (if you want weekly runs):
   ```yaml
   on:
     schedule:
       - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
     workflow_dispatch:
   ```

3. **(Optional)** If you want automatic commits, uncomment the commit step:
   ```yaml
   - name: Commit and push data.json
     run: |
       git config --local user.email "github-actions[bot]@users.noreply.github.com"
       git config --local user.name "github-actions[bot]"
       git add public/data.json
       git diff --staged --quiet || git commit -m "chore: update web ecosystem data [skip ci]"
       git push
   ```

4. Commit and push:
   ```bash
   git add .github/workflows/crawler.yml
   git commit -m "chore: enable weekly crawler workflow"
   git push
   ```

---

## Step 4: Test the Workflow

1. Go to **Actions** tab in your repository
2. Select **Web Ecosystem Crawler** workflow
3. Click **Run workflow** → **Run workflow**
4. Monitor the progress

The workflow will:
- Install dependencies
- Build the crawler
- Run the crawl
- Upload `data.json` as an artifact

---

## Step 5: Review and Deploy

1. After successful run, download the artifact from the workflow run page
2. Review the `data.json` file
3. If everything looks good:
   - Either manually commit it to the repo, or
   - Uncomment the auto-commit step in the workflow (see Step 3)

---

## Workflow Behavior

### Default Configuration (Safe)
- ✅ Manual trigger only (via workflow_dispatch)
- ✅ Uploads artifact for review
- ❌ Does NOT auto-commit

### With Schedule Enabled
- ✅ Runs weekly (Sunday 2 AM UTC)
- ✅ Can still be triggered manually
- ✅ Uploads artifact for review
- ❌ Does NOT auto-commit (unless you uncommented the step)

### With Auto-Commit Enabled
- ✅ Automatically commits updated `data.json`
- ✅ Uses `[skip ci]` to prevent workflow loops
- ✅ Attributes commits to `github-actions[bot]`
- ⚠️ **WARNING**: Vercel will auto-deploy on every commit to main

---

## Customizing the Schedule

Edit the cron expression in `crawler.yml`:

```yaml
schedule:
  - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
```

Common schedules:
- **Daily at 2 AM UTC**: `'0 2 * * *'`
- **Weekly on Monday at 3 AM UTC**: `'0 3 * * 1'`
- **Monthly on the 1st at 2 AM UTC**: `'0 2 1 * *'`
- **Twice weekly (Mon & Thu at 2 AM UTC)**: `'0 2 * * 1,4'`

Use [crontab.guru](https://crontab.guru/) to build custom schedules.

---

## Monitoring & Notifications

### Check Workflow Status
- Go to **Actions** tab
- View recent runs
- Check logs for any errors

### Add Notifications (Optional)

Add a notification step to the workflow:

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        title: 'Crawler workflow failed',
        body: 'The weekly crawler run failed. Check the logs: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}'
      })
```

Or integrate with Slack, email, etc.

---

## Troubleshooting

### Workflow Not Showing Up
- Ensure file is named `crawler.yml` (not `.template`)
- Check file is in `.github/workflows/` directory
- Commit and push changes

### Secret Not Working
- Verify secret name is exactly `CRAWLER_CONTACT_EMAIL`
- Check secret value doesn't have extra spaces
- Re-save the secret if needed

### Permission Denied on Push
- Enable write permissions (see Step 2)
- Ensure you've uncommented the commit step

### Workflow Runs Too Often
- Check your cron schedule
- Verify no push triggers are enabled
- Add `[skip ci]` to commit messages

### Data Quality Issues
- Download the artifact and review locally
- Check crawler logs in the workflow run
- Test the crawler locally with same settings

---

## Cost Considerations

GitHub Actions is free for public repositories and includes:
- 2,000 minutes/month for private repos (free tier)
- This workflow uses ~5 minutes per run
- Weekly runs = ~20 minutes/month

---

## Security Best Practices

✅ **DO:**
- Keep `CRAWLER_CONTACT_EMAIL` as a secret (not in code)
- Review workflow logs for any exposed data
- Use `[skip ci]` to prevent infinite loops
- Monitor your crawler's impact on target servers

❌ **DON'T:**
- Commit `.env` files
- Hardcode email addresses in workflow
- Run crawler more than once daily without good reason
- Ignore 429/503 errors from target servers

---

## Next Steps

After setup:
1. ✅ Run workflow manually to test
2. ✅ Review the artifact
3. ✅ Enable schedule (if desired)
4. ✅ Enable auto-commit (if desired)
5. ✅ Set up notifications (optional)
6. ✅ Document any customizations

---

**Questions?** Check the main README or open a GitHub issue.

**Last Updated**: October 28, 2025

