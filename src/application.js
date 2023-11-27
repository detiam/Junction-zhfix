import Gio from "gi://Gio";
import Adw from "gi://Adw";
import GLib from "gi://GLib";
import Xdp from "gi://Xdp";

import Window from "./window.js";
import Welcome from "./welcome.js";
import About from "./about.js";
import ShortcutsWindow from "./ShortcutsWindow.js";

import "./style.css";

export default function Application() {
  const application = new Adw.Application({
    application_id: "re.sonny.Junction",
    flags: Gio.ApplicationFlags.HANDLES_COMMAND_LINE,
  });

  // https://gitlab.gnome.org/GNOME/glib/-/issues/1960
  // https://github.com/sonnyp/Junction/commit/5140f410ffd2899a3bb1aba5929f9891741e02fb
  if (Xdp.Portal.running_under_sandbox()) {
    GLib.spawn_command_line_async(
      "gio mime x-scheme-handler/https re.sonny.Junction.desktop",
    );
    GLib.spawn_command_line_async(
      "gio mime x-scheme-handler/http re.sonny.Junction.desktop",
    );
  }

  Adw.StyleManager.get_default().set_color_scheme(Adw.ColorScheme.FORCE_DARK);

  application.connect("command-line", (self, argObject, hint) => {
    const args = argObject.get_arguments();
    args.forEach(arg => {
      if (arg === args[0]) return
      Window({
        application,
        arg,
      });
    });
  });

  application.connect("activate", () => {
    Welcome({
      application,
    });
  });

  application.connect("handle-local-options", (self, options) => {
    return options.contains("terminate_after_init") ? 0 : -1;
  });

  // This shouldn't be in the main options but rather in a "Development" group
  // unfortunally - I couldn't use OptionGroup
  // https://gitlab.gnome.org/GNOME/gjs/-/issues/448
  application.add_main_option(
    "terminate_after_init",
    null,
    GLib.OptionFlags.NONE,
    GLib.OptionArg.NONE,
    "Exit after initialization complete",
    null,
  );

  application.set_option_context_description("<https://junction.sonny.re>");
  application.set_option_context_parameter_string("[URI…]");
  // TODO: Add examples
  // application.set_option_context_summary("");

  const quit = new Gio.SimpleAction({
    name: "quit",
    parameter_type: null,
  });
  quit.connect("activate", () => {
    application.quit();
  });
  application.add_action(quit);
  application.set_accels_for_action("app.quit", ["<Primary>Q"]);

  application.set_accels_for_action("window.close", ["<Primary>W", "Escape"]);
  application.set_accels_for_action("win.copy", ["<Primary>C"]);

  const showAboutDialog = new Gio.SimpleAction({
    name: "about",
    parameter_type: null,
  });
  showAboutDialog.connect("activate", () => {
    About({ application });
  });
  application.add_action(showAboutDialog);

  const showShortCutsWindow = new Gio.SimpleAction({
    name: "shortcuts",
    parameter_type: null,
  });
  showShortCutsWindow.connect("activate", () => {
    ShortcutsWindow({ application });
  });
  application.add_action(showShortCutsWindow);
  application.set_accels_for_action("app.shortcuts", ["<Primary>question"]);

  return application;
}
