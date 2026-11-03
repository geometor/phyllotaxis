"""CLI entry point for `geometor.phyllotaxis`."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from rich.console import Console
from rich.table import Table

from .angles import fibonacci_convergents, sweep_phi
from .paths3d import MeristemConfig, propagate_3d


def main(argv: list[str] | None = None) -> int:
    """Run the `phyllotaxis` CLI."""
    parser = argparse.ArgumentParser(
        prog="phyllotaxis",
        description="GEOMETOR • phyllotaxis — 2D/3D botanical propagation and meristem analysis.",
    )
    sub = parser.add_subparsers(dest="command")

    summary_p = sub.add_parser(
        "summary", help="Display a summary of 3D meristem path propagation."
    )
    summary_p.add_argument("--steps", type=int, default=34, help="Plastochron steps.")
    summary_p.add_argument(
        "--depth", type=int, default=2, help="Max meristem recursion depth."
    )
    summary_p.add_argument(
        "--export", type=Path, default=None, help="Optional JSON output path."
    )

    angles_p = sub.add_parser(
        "angles", help="List Fibonacci rational convergents to the Golden Angle."
    )
    angles_p.add_argument("--count", type=int, default=8, help="Number of convergents.")

    args = parser.parse_args(argv)
    console = Console()

    if args.command == "angles":
        exact = sweep_phi()
        console.print(
            f"[bold gold1]Symbolic Golden Angle:[/bold gold1] {exact} = {float(exact):.8f} rad "
            f"([cyan]{float(exact) * 180 / 3.141592653589793:.6f}°[/cyan])"
        )
        tbl = Table(title="Fibonacci Rational Convergents (F_k / F_{k+2})")
        tbl.add_column("Fraction", style="bold cyan")
        tbl.add_column("Divergence (°)", justify="right", style="green")
        tbl.add_column("Δ from Golden Angle (°)", justify="right", style="yellow")
        golden_deg = float(exact) * 180.0 / 3.141592653589793
        for num, den, deg in fibonacci_convergents(args.count):
            tbl.add_row(f"{num}/{den}", f"{deg:.6f}°", f"{deg - golden_deg:+.6f}°")
        console.print(tbl)
        return 0

    steps = getattr(args, "steps", 34)
    depth = getattr(args, "depth", 2)
    cfg = MeristemConfig(max_depth=depth)
    nodes = propagate_3d(steps=steps, config=cfg)

    tbl = Table(
        title=f"GEOMETOR • 3D Meristem Propagation (steps={steps}, max_depth={depth})"
    )
    tbl.add_column("Generation", justify="center", style="bold cyan")
    tbl.add_column("Total Nodes (Paths)", justify="right", style="green")
    tbl.add_column("Active Meristems", justify="right", style="gold1")

    by_gen: dict[int, list] = {}
    for n in nodes:
        by_gen.setdefault(n.generation, []).append(n)

    for gen in sorted(by_gen):
        group = by_gen[gen]
        meristems = sum(1 for item in group if item.is_meristem)
        label = "0 (Primary Shoot)" if gen == 0 else f"{gen} (Lateral Gen-{gen})"
        tbl.add_row(label, str(len(group)), str(meristems))

    console.print(tbl)

    export_path = getattr(args, "export", None)
    if export_path is not None:
        payload = {
            "steps": steps,
            "max_depth": depth,
            "nodes": [n.to_dict() for n in nodes],
        }
        export_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        console.print(f"[green]Exported {len(nodes)} 3D node paths to {export_path}[/green]")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
