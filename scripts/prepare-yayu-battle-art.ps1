# Same independent background-removal workflow approved for battle pose assets; preserve source.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Imaging;
public static class YayuAlpha {
 public static void Save(string source,string target){using(var s=new Bitmap(source))using(var d=new Bitmap(s.Width,s.Height,PixelFormat.Format32bppArgb)){
  for(int y=0;y<s.Height;y++)for(int x=0;x<s.Width;x++){var p=s.GetPixel(x,y);int hi=Math.Max(p.R,Math.Max(p.G,p.B)),lo=Math.Min(p.R,Math.Min(p.G,p.B));d.SetPixel(x,y,Color.FromArgb(lo>=210&&hi-lo<=18?0:255,p.R,p.G,p.B));}
  d.Save(target,ImageFormat.Png);
 }}
}
'@
$root=Split-Path $PSScriptRoot -Parent
[YayuAlpha]::Save((Join-Path $root 'docs/concepts/yayu-battle-poses-raw.png'),(Join-Path $root 'public/battle-ui/yayu-battle-poses-v1.png'))
[YayuAlpha]::Save((Join-Path $root 'public/spirit-yayu.png'),(Join-Path $root 'public/battle-ui/yayu-original-cutout-v1.png'))
