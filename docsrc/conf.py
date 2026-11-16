from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from photon_platform.publish.global_conf import *
import geometor.phyllotaxis as module

version = module.__version__

org = "geometor"
org_name = "GEOMETOR"

repo = "phyllotaxis"
repo_name = "phyllotaxis"

setup_globals(org, org_name, repo, repo_name)

site_title = "Phyllotaxis"
project = site_title
html_title = f"{site_title} • {org_name}"

if "intro.rst" not in exclude_patterns:
    exclude_patterns.append("intro.rst")

templates_path = ["_templates"] + list(globals().get("templates_path", []))
html_css_files = list(globals().get("html_css_files", [])) + [
    "css/phyllotaxis-demos.css",
]


def _render_custom_demo_template(
    app, pagename: str, templatename: str, context: dict, doctree
) -> None:
    """Render page-level `:template:` files from `docsrc/_templates/` inside the theme layout."""
    meta = app.env.metadata.get(pagename, {})
    custom_tpl = meta.get("template")
    if custom_tpl and "body" in context:
        context["body"] = app.builder.templates.render(custom_tpl, context)


def setup(app) -> None:
    """Register Sphinx event hooks for custom interactive demonstration templates."""
    app.connect("html-page-context", _render_custom_demo_template)

