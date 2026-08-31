# User-approved independent background removal and frame repacking. Originals stay untouched.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class JinweiCutout {
  public static Bitmap Frame(Bitmap source, Rectangle region, float maxScale) {
    var cut = new Bitmap(region.Width, region.Height, PixelFormat.Format32bppArgb);
    int minX=region.Width,minY=region.Height,maxX=0,maxY=0;
    for(int y=0;y<region.Height;y++) for(int x=0;x<region.Width;x++) {
      Color p=source.GetPixel(region.X+x,region.Y+y);
      int hi=Math.Max(p.R,Math.Max(p.G,p.B)),lo=Math.Min(p.R,Math.Min(p.G,p.B));
      // White/gray grid is neutral; warm cream fur and amber flame are chromatic.
      int a=(lo>=210 && hi-lo<=18)?0:255;
      cut.SetPixel(x,y,Color.FromArgb(a,p.R,p.G,p.B));
      if(a>0){minX=Math.Min(minX,x);maxX=Math.Max(maxX,x);minY=Math.Min(minY,y);maxY=Math.Max(maxY,y);}
    }
    var output=new Bitmap(1024,1024,PixelFormat.Format32bppArgb);
    float scale=Math.Min(maxScale,Math.Min(920f/(maxX-minX+1),800f/(maxY-minY+1)));
    float w=(maxX-minX+1)*scale,h=(maxY-minY+1)*scale;
    using(var g=Graphics.FromImage(output)) {
      g.Clear(Color.Transparent);
      g.InterpolationMode=System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
      g.DrawImage(cut,new RectangleF((1024-w)/2,900-h,w,h),new RectangleF(minX,minY,maxX-minX+1,maxY-minY+1),GraphicsUnit.Pixel);
    }
    cut.Dispose(); return output;
  }
}
'@
$root=Split-Path $PSScriptRoot -Parent
$idle=[System.Drawing.Bitmap]::new((Join-Path $root 'docs/concepts/jinwei-battle-posture/idle-raw.png'))
$run=[System.Drawing.Bitmap]::new((Join-Path $root 'docs/concepts/jinwei-battle-posture/run-raw.png'))
try {
  $stand=[JinweiCutout]::Frame($idle,[System.Drawing.Rectangle]::new(0,0,$idle.Width,$idle.Height),1)
  # Boundary at the empty gap, not the original equal-cell line which cuts off the first paw.
  $first=[JinweiCutout]::Frame($run,[System.Drawing.Rectangle]::new(0,0,945,$run.Height),1.06)
  $second=[JinweiCutout]::Frame($run,[System.Drawing.Rectangle]::new(945,0,$run.Width-945,$run.Height),1.06)
  $sheet=[System.Drawing.Bitmap]::new(2048,1024)
  $canvas=[System.Drawing.Graphics]::FromImage($sheet)
  $canvas.Clear([System.Drawing.Color]::Transparent)
  $canvas.DrawImageUnscaled($first,0,0); $canvas.DrawImageUnscaled($second,1024,0); $canvas.Dispose()
  $stand.Save((Join-Path $root 'public/battle-ui/jinwei-battle-idle-v1.png'),[System.Drawing.Imaging.ImageFormat]::Png)
  $sheet.Save((Join-Path $root 'public/battle-ui/jinwei-forward-run-v1.png'),[System.Drawing.Imaging.ImageFormat]::Png)
  $stand.Dispose();$first.Dispose();$second.Dispose();$sheet.Dispose()
} finally {$idle.Dispose();$run.Dispose()}
