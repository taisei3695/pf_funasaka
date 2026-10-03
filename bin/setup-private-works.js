import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { projectRoot } from "./utils/paths.js";

// wp-env mappings are always inside /var/www/html. Never map secrets through them.
// Install the local Apache configuration directly outside the document root instead.
function runDockerCommand(args, options = {}) {
  const result = spawnSync("docker", args, { encoding: "utf8", ...options });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || "Docker command failed");
  return result.stdout.trim();
}
const expected = resolve(projectRoot, "wordpress/themes").replaceAll("\\", "/").toLowerCase();
const ids = runDockerCommand(["ps", "--filter", "label=com.docker.compose.service=wordpress", "--format", "{{.ID}}"]);
const container = ids
  .split(/\s+/)
  .filter(Boolean)
  .find(id => {
    const [info] = JSON.parse(runDockerCommand(["inspect", id]));
    return info.Mounts.some(
      mount => (mount.Destination === "/var/www/html/wp-content/themes" && mount.Source.replaceAll("\\", "/").toLowerCase().endsWith(expected.replace(/^c:/, "/c"))) || mount.Source.replaceAll("\\", "/").toLowerCase() === expected,
    );
  });
if (!container) throw new Error("Start this project's wp-env before syncing Private Works.");
const authDir = resolve(projectRoot, ".cache/private-auth");
const mediaDir = resolve(projectRoot, ".cache/private-media");
mkdirSync(authDir, { recursive: true });
mkdirSync(mediaDir, { recursive: true });
const credentialsPath = resolve(authDir, "credentials.json");
if (!existsSync(credentialsPath)) writeFileSync(credentialsPath, JSON.stringify({ username: "portfolio", password: randomBytes(24).toString("base64url") }, null, 2));
const credentials = JSON.parse(readFileSync(credentialsPath, "utf8").replace(/^\uFEFF/, ""));
const hash = runDockerCommand(["exec", "-i", container, "htpasswd", "-niB", credentials.username], { input: credentials.password + "\n" });
writeFileSync(resolve(authDir, ".htpasswd"), hash + "\n");
const configuration = `<Directory /var/www/html>
  AllowOverride All
  Options -Indexes
</Directory>
<LocationMatch "^/private-works(?:/|$)">
  AuthType Basic
  AuthName "Private Works"
  AuthBasicProvider file
  AuthUserFile /run/portfolio-private/.htpasswd
  Require valid-user
  SetEnv AUTH_TYPE Basic
  SetEnv PORTFOLIO_PRIVATE_AUTH_ENABLED 1
  SetEnv PORTFOLIO_PRIVATE_MEDIA_DIR /var/lib/portfolio-private
</LocationMatch>
`;
writeFileSync(resolve(authDir, "portfolio-private.conf"), configuration);
runDockerCommand(["exec", container, "mkdir", "-p", "/run/portfolio-private", "/var/lib/portfolio-private"]);
runDockerCommand(["cp", resolve(authDir, ".htpasswd"), container + ":/run/portfolio-private/.htpasswd"]);
runDockerCommand(["cp", resolve(authDir, "portfolio-private.conf"), container + ":/etc/apache2/conf-enabled/portfolio-private.conf"]);
runDockerCommand(["cp", mediaDir + "/.", container + ":/var/lib/portfolio-private/"]);
runDockerCommand(["exec", container, "chmod", "644", "/run/portfolio-private/.htpasswd"]);
runDockerCommand(["exec", container, "apachectl", "-t"]);
runDockerCommand(["exec", container, "apachectl", "-k", "graceful"]);
console.log("Private Works: local server Basic auth and protected media configured.");
console.log("Local credentials: .cache/private-auth/credentials.json (excluded from Git)");
