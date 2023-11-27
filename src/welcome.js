import Gtk from "gi://Gtk";

import { spawn_sync, spawn } from "./util.js";
import Interface from "./welcome.blp";

export default function Welcome({ application }) {
  const builder = Gtk.Builder.new_from_resource(Interface);

  const window = builder.get_object("welcome");
  if (__DEV__) window.add_css_class("devel");
  window.set_application(application);

  const test_button = builder.get_object("demo_button");
  test_button.connect("activate-link", () => {
    spawn(`xdg-open ${test_button.uri}`)
    return true;
  });

  const install_button = builder.get_object("install_button");
  install_button.connect("clicked", () => {
    const success = setAsDefaultApplicationForWeb();
    spawn(`xdg-open https://junction.sonny.re/${success ? "success" : "error"}`)
  });

  window.present();

  return { window };
}

function setAsDefaultApplicationForWeb() {
  try {
    if (
      !spawn_sync(
        "gio mime x-scheme-handler/https re.sonny.Junction.desktop",
      ) ||
      !spawn_sync("gio mime x-scheme-handler/http re.sonny.Junction.desktop")
    )
      return false;
  } catch (err) {
    logError(err);
    return false;
  }
  return true;
}

// const types = [
//   "x-scheme-handler/http",
//   "x-scheme-handler/https",
//   "text/html",
//   "text/xml",
//   "application/xhtml+xml",
// ];
// for (const type of types) {
//   spawn(`gio mime ${type} re.sonny.Junction.desktop`);
// }
