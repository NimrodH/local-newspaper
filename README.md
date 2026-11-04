# Local Newspaper

A local newspaper site: readers browse published issues and articles; editors manage them in a password-protected editor.

## Links

| Link | Usage |
| --- | --- |
| [rakefetnews.netlify.app](https://rakefetnews.netlify.app) | **Public site (production).** Readers see the latest published issue with its articles. Deployed automatically when changes are merged into `main`. |
| [rakefetnews.netlify.app/?view=titles](https://rakefetnews.netlify.app/?view=titles) | **Titles view.** Opens the site straight on the list of article titles, so readers can scan the issue and open only what interests them. Handy as a direct link to share. |
| [rakefetnews.netlify.app/editor](https://rakefetnews.netlify.app/editor) | **Editor.** Create, edit, publish and delete issues and articles, and upload images. Requires the editor password (`EDITOR_PASSWORD`). |
| [develop--rakefetnews.netlify.app](https://develop--rakefetnews.netlify.app) | **Test site (develop branch).** Built from the `develop` branch, used to check changes before they go live. **Note:** right now the test site uses the same database as the live site, so any content added, edited or deleted here also changes the live site. Add `/editor` or `/?view=titles` for the same pages as above. |

## Development

- `npm run dev` — run locally
- `npm run typecheck` — type check (run before committing)
- `npm run build` — production build

Work on `develop`; open pull requests from `develop` into `main`. Merging into `main` deploys the production site on Netlify.

Built with React Router 7, Supabase and Netlify. See [CLAUDE.md](CLAUDE.md) for project conventions.
