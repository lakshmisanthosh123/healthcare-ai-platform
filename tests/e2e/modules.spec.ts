import { expect, test, type Page } from "@playwright/test";

interface DemoAccount {
  email: string;
  password: string;
  home: string;
}

const demoPassword = "DemoPass123!";
const accounts = {
  admin: {
    email: "admin@example.com",
    password: demoPassword,
    home: "/users",
  },
  doctor: {
    email: "doctor@example.com",
    password: demoPassword,
    home: "/profile",
  },
  patient: {
    email: "patient@example.com",
    password: demoPassword,
    home: "/patient",
  },
  staff: {
    email: "staff@example.com",
    password: demoPassword,
    home: "/profile",
  },
} satisfies Record<string, DemoAccount>;

async function signIn(page: Page, account: DemoAccount) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(account.email);
  await page.getByRole("textbox", { name: "Password" }).fill(account.password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(
    new RegExp(`${account.home.replace("/", "\\/")}$`),
    { timeout: 15_000 },
  );
}

test("Auth module shows the login form", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
});

for (const [role, account] of Object.entries(accounts)) {
  test(`${role} module uses the shared responsive portal`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page, account);

    await expect(page.locator(".portal-shell")).toBeVisible();
    await expect(page.locator(".portal-shell__topbar")).toBeVisible();
    await expect(
      page.locator(".portal-shell__actions .portal-shell__language-trigger"),
    ).toBeVisible();
    await expect(
      page.locator(".portal-shell__actions .portal-shell__action-button"),
    ).toBeVisible();

    const navigation = page.locator(".portal-shell__sidebar");
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(navigation).toHaveClass(/is-open/);
    await expect(
      page.locator(".portal-shell__nav").getByRole("link").first(),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(navigation).not.toHaveClass(/is-open/);

    const documentWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    expect(documentWidth).toBeLessThanOrEqual(390);
  });
}

test("Admin opens Dashboard and manages each directory", async ({ page }) => {
  await signIn(page, accounts.admin);

  await page.getByRole("link", { name: "Dashboard", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "Total Patients" }),
  ).toBeVisible();

  for (const reportPage of [
    { name: "Doctor Analytics", path: "/dashboard/doctors" },
    { name: "Patient Analytics", path: "/dashboard/patients" },
    { name: "Revenue Dashboard", path: "/dashboard/revenue" },
    { name: "Appointment Dashboard", path: "/dashboard/appointments" },
  ]) {
    await page.getByRole("link", { name: reportPage.name }).click();
    await expect(page).toHaveURL(new RegExp(`${reportPage.path}$`));
    await expect(
      page.getByRole("heading", { name: reportPage.name }),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "Executive Dashboard" }).click();

  await page.getByRole("link", { name: "User management" }).click();
  await expect(page).toHaveURL(/\/users$/);

  await expect(page.getByRole("table")).toContainText("Jordan Lee");
  await page.getByRole("searchbox", { name: "Search patients" }).fill("Mia");
  await expect(page.getByRole("table")).toContainText("Mia Garcia");
  await expect(page.getByRole("table")).not.toContainText("Jordan Lee");
  await page.getByRole("combobox", { name: "Status" }).selectOption("active");
  const patientDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Patients" }).click();
  expect((await patientDownload).suggestedFilename()).toMatch(
    /^patients-.*\.csv$/,
  );

  await page.getByRole("tab", { name: "Doctors" }).click();
  await expect(page.getByRole("table")).toContainText("Amelia Harris");
  await page
    .getByRole("combobox", { name: "Specialty" })
    .selectOption("Cardiology");
  const doctorDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Doctors" }).click();
  expect((await doctorDownload).suggestedFilename()).toMatch(
    /^doctors-.*\.csv$/,
  );

  await page.getByRole("tab", { name: "Staff" }).click();
  await expect(page.getByRole("table")).toContainText("Olivia Martin");
  await page
    .getByRole("searchbox", { name: "Search staff" })
    .fill("Coordinator");
  await expect(page.getByRole("table")).toContainText("Olivia Martin");
  await page
    .getByRole("combobox", { name: "Department" })
    .selectOption("Operations");
  const staffDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Staff" }).click();
  expect((await staffDownload).suggestedFilename()).toMatch(/^staff-.*\.csv$/);
});

test("Admin module adapts to a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page, accounts.admin);

  await expect(
    page.getByRole("navigation", { name: "Admin sections" }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: "Patients" })).toBeVisible();
  await expect(
    page.getByRole("searchbox", { name: "Search patients" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  await expect(
    page
      .locator(".portal-shell__actions")
      .getByRole("button", { name: "Logout" }),
  ).toBeVisible();
  await expect(page.locator(".portal-shell__language-trigger")).toBeVisible();

  const documentWidth = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  expect(documentWidth).toBeLessThanOrEqual(390);
});

test("Admin profile has photo and document controls", async ({ page }) => {
  await signIn(page, accounts.admin);
  await page.goto("/profile");
  await expect(page.locator('input[accept*="image/"]')).toBeVisible();
  await expect(page.locator('input[accept*=".pdf"]')).toBeVisible();
});

test("Doctor profile edit has photo and document controls", async ({
  page,
}) => {
  await signIn(page, accounts.doctor);
  await page.getByRole("button", { name: "Edit Profile" }).click();
  await expect(page.locator('input[accept*="image/"]')).toBeVisible();
  await expect(page.locator('input[accept*=".pdf"]')).toBeVisible();
});

for (const doctor of [
  {
    email: "doctor@example.com",
    name: "Amelia Harris",
    patients: ["Jordan Lee"],
    absentPatients: ["Mia Garcia", "Ethan Brown"],
  },
  {
    email: "noah.patel@example.com",
    name: "Noah Patel",
    patients: ["Jordan Lee", "Mia Garcia"],
    absentPatients: ["Ethan Brown"],
  },
  {
    email: "sophia.chen@example.com",
    name: "Sophia Chen",
    patients: ["Ethan Brown"],
    absentPatients: ["Jordan Lee", "Mia Garcia"],
  },
]) {
  test(`${doctor.name} sees only their own doctor data`, async ({ page }) => {
    await signIn(page, {
      email: doctor.email,
      password: demoPassword,
      home: "/profile",
    });

    await expect(page.locator(".profile-page h2")).toHaveText(doctor.name);
    await page.goto("/patients");
    const patientRows = page.getByRole("table").locator("tbody tr");
    for (const patient of doctor.patients) {
      const [firstName, ...lastName] = patient.split(" ");
      await expect(patientRows.filter({ hasText: firstName })).toContainText(
        lastName.join(" "),
      );
    }
    for (const patient of doctor.absentPatients) {
      const [firstName] = patient.split(" ");
      await expect(patientRows.filter({ hasText: firstName })).toHaveCount(0);
    }
  });
}

test("Patient profile edit has photo and document controls", async ({
  page,
}) => {
  await signIn(page, accounts.patient);
  await page.getByRole("button", { name: "Edit Profile" }).click();
  await expect(page.locator('input[accept*="image/"]')).toBeVisible();
  await expect(page.locator('input[accept*=".pdf"]')).toBeVisible();
});

test("Staff profile has photo and document controls", async ({ page }) => {
  await signIn(page, accounts.staff);
  await expect(page.locator('input[accept*="image/"]')).toBeVisible();
  await expect(page.locator('input[accept*=".pdf"]')).toBeVisible();
});
