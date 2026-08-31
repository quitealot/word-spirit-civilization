# Read-only asset acceptance: RGBA alone is not evidence of a removed checkerboard.
Add-Type -AssemblyName System.Drawing
$assetPath = Join-Path $PSScriptRoot '../public/battle-ui/jinwei-melee-poses-v1.png'
$bitmap = [System.Drawing.Bitmap]::new($assetPath)
try {
  if ($bitmap.Width -ne $bitmap.Height -or $bitmap.Width % 2 -ne 0) { throw 'Pose sheet must have four equal square cells.' }
  $cellSize = $bitmap.Width / 2
  $clear = 0
  $samples = 0
  foreach ($cellY in 0,1) {
    foreach ($cellX in 0,1) {
      foreach ($fraction in 0.04,0.25,0.5,0.75,0.96) {
        foreach ($vertical in 0.025,0.975) {
          $pixel = $bitmap.GetPixel([int](($cellX + $fraction) * $cellSize), [int](($cellY + $vertical) * $cellSize))
          $samples++
          if ($pixel.A -lt 16) { $clear++ }
        }
      }
    }
  }
  if ($clear / $samples -lt 0.9) { throw "Baked background remains: only $clear/$samples empty-margin samples are transparent." }
  Write-Output "PASS pose sheet $($bitmap.Width)x$($bitmap.Height); $clear/$samples transparent margin samples."
} finally { $bitmap.Dispose() }
