# Staff module

The staff microfrontend is served on port `3006` and exposes `./App` for the
shell federation host. The shell selects it for sessions whose role is `staff`.
The module also permits `admin` sessions when opened directly.

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the REST API base
URL before starting the app. It expects authenticated endpoints for:

- `GET /staff` and `GET /staff/:id`
- `POST /staff`, `PUT /staff/:id`, and `DELETE /staff/:id`
- `GET /staff/profile`, `PUT /staff/profile`, and
  `PUT /staff/profile/password`
- `GET /staff/dashboard`

Run `pnpm --filter staff dev` to start the module. Run
`pnpm exec turbo build --filter=staff...` to build the module with its workspace
dependencies.
