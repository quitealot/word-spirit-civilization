# Read-only checks: native alpha, two equal run cells, and clear sprite margins.
param([Parameter(Mandatory=$true)][string]$IdlePath, [Parameter(Mandatory=$true)][string]$RunPath)
Add-Type -AssemblyName System.Drawing
foreach ($entry in @(@{Path=$IdlePath; Columns=1}, @{Path=$RunPath; Columns=2})) {
  $bitmap = [System.Drawing.Bitmap]::new((Resolve-Path -LiteralPath $entry.Path).Path)
  try {
    if ($bitmap.Width -ne $bitmap.Height * $entry.Columns) { throw "Expected equal square cells: $($entry.Path)" }
    $clear=0; $samples=0; $opaque=0
    for ($column=0; $column -lt $entry.Columns; $column++) {
      foreach ($fraction in 0.025,0.25,0.5,0.75,0.975) {
        foreach ($edge in 0.015,0.985) {
          $pixel=$bitmap.GetPixel([int](($column+$fraction)*$bitmap.Height),[int]($edge*$bitmap.Height))
          $samples++; if ($pixel.A -lt 16) { $clear++ }
        }
      }
      for ($y=0.1; $y -lt 0.9; $y+=0.1) {
        for ($x=0.1; $x -lt 0.9; $x+=0.1) {
          if ($bitmap.GetPixel([int](($column+$x)*$bitmap.Height),[int]($y*$bitmap.Height)).A -gt 240) { $opaque++ }
        }
      }
    }
    if ($clear/$samples -lt 0.9) { throw "Background not transparent: $clear/$samples clear margins: $($entry.Path)" }
    if ($opaque -lt 5*$entry.Columns) { throw "Missing opaque subject: $($entry.Path)" }
    Write-Output "PASS $($entry.Path): $($bitmap.Width)x$($bitmap.Height), $clear/$samples clear margins, $opaque opaque subject samples"
  } finally { $bitmap.Dispose() }
}
