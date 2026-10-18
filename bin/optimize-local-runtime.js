import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { projectRoot } from "./utils/paths.js";

function runDockerCommand(args, inherit = false) {
  const result = spawnSync("docker", args, { encoding: "utf8", stdio: inherit ? "inherit" : "pipe", timeout: 180000 });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr || "Local Docker command failed");
  return result.stdout?.trim() ?? "";
}

function findLocalWordPressContainer() {
  const expected = resolve(projectRoot, "wordpress/themes").replaceAll("\\", "/").toLowerCase();
  const ids = runDockerCommand(["ps", "--filter", "label=com.docker.compose.service=wordpress", "--format", "{{.ID}}"]);
  for (const id of ids.split(/\s+/).filter(Boolean)) {
    const [info] = JSON.parse(runDockerCommand(["inspect", id]));
    if (
      info.Mounts.some(mount => {
        const source = mount.Source.replaceAll("\\", "/").toLowerCase();
        return mount.Destination === "/var/www/html/wp-content/themes" && (source === expected || source.endsWith(expected.replace(/^([a-z]):/, "/$1")));
      })
    )
      return info;
  }
  throw new Error("Start this project's wp-env before applying local runtime storage.");
}

const info = findLocalWordPressContainer();
const labels = info.Config.Labels;
const project = labels["com.docker.compose.project"];
const baseConfig = labels["com.docker.compose.project.config_files"].split(",")[0];
if (!/^[a-z0-9_-]+$/.test(project)) throw new Error("Unexpected local Compose project name.");
const compose = ["compose", "-p", project, "-f", baseConfig];
const runtimeDir = resolve(projectRoot, "work/local-runtime");
mkdirSync(runtimeDir, { recursive: true });
const overridePath = resolve(runtimeDir, "compose.override.json");

if (process.argv.includes("--restore")) {
  runDockerCommand([...compose, "up", "-d", "--no-deps", "--no-build", "wordpress", "cli"], true);
  console.log("Restored wp-env's original core bind mount. DB and optimized core volume retained.");
} else {
  const volume = `${project}_portfolio-core`;
  runDockerCommand(["volume", "create", "--label", `portfolio.project=${project}`, volume]);
  const root = info.Mounts.find(mount => mount.Destination === "/var/www/html");
  if (root?.Type !== "volume" || root.Name !== volume) {
    // Fixed Linux paths only. Seed the installed version once; never clear the source or an existing volume.
    const seed = `set -eu
if [ ! -f /portfolio-core/.portfolio-core-ready ]; then
  cp -a /var/www/html/wp-admin /var/www/html/wp-includes /portfolio-core/
  find /var/www/html -maxdepth 1 -type f -exec cp -p {} /portfolio-core/ \\;
  mkdir -p /portfolio-core/wp-content
  for dir in languages mu-plugins; do
    if [ -d /var/www/html/wp-content/$dir ]; then cp -a /var/www/html/wp-content/$dir /portfolio-core/wp-content/; fi
  done
  touch /portfolio-core/.portfolio-core-ready
fi
cp -p /var/www/html/wp-config.php /portfolio-core/wp-config.php
if [ -f /var/www/html/.htaccess ]; then cp -p /var/www/html/.htaccess /portfolio-core/.htaccess; fi
chown -R 1000:1000 /portfolio-core`;
    runDockerCommand(["run", "--rm", "--pull=never", "--network=none", "--user=0", "--volumes-from", info.Id, "-v", `${volume}:/portfolio-core`, "--entrypoint", "sh", info.Image, "-c", seed], true);
  }
  const coreMount = { type: "volume", source: "portfolio-core", target: "/var/www/html", volume: { nocopy: true } };
  const phpMount = { type: "bind", source: resolve(projectRoot, "config/local-php-performance.ini"), target: "/usr/local/etc/php/conf.d/zz-portfolio-local-performance.ini", read_only: true };
  writeFileSync(overridePath, JSON.stringify({ services: { wordpress: { volumes: [coreMount, phpMount] }, cli: { volumes: [coreMount, phpMount] } }, volumes: { "portfolio-core": { external: true, name: volume } } }, null, 2));
  const optimizedCompose = [...compose, "-f", overridePath];
  const merged = JSON.parse(runDockerCommand([...optimizedCompose, "config", "--format", "json"]));
  for (const service of ["wordpress", "cli"]) {
    const mount = merged.services[service].volumes.find(item => item.target === "/var/www/html");
    if (mount?.type !== "volume" || mount.source !== "portfolio-core") throw new Error("Core volume override was not applied.");
  }
  try {
    runDockerCommand([...optimizedCompose, "up", "-d", "--no-deps", "--no-build", "wordpress", "cli"], true);
  } catch (error) {
    runDockerCommand([...compose, "up", "-d", "--no-deps", "--no-build", "wordpress", "cli"], true);
    throw error;
  }
  console.log("Local WordPress core uses Docker storage; theme, plugins, uploads and DB stay in place.");
}
