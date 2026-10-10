Add-Type -AssemblyName System.Drawing
Get-ChildItem 'C:\Users\ytkar\Desktop\tattooandpiercing\tattooimages' -File | Sort-Object Name | ForEach-Object {
  try {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $kb = [math]::Round($_.Length / 1KB)
    Write-Output ("{0}|{1}x{2}|{3}KB" -f $_.Name, $img.Width, $img.Height, $kb)
    $img.Dispose()
  } catch {
    Write-Output ("{0}|ERROR|{1}KB" -f $_.Name, [math]::Round($_.Length / 1KB))
  }
}
