@echo off
echo Testing ElevenLabs API with curl...
echo.

REM First, let's create a simple test WAV file
echo Creating test WAV file...
powershell -Command "
# Create a simple WAV header for a 1-second silence
$wavHeader = New-Object byte[] 44
$wavData = New-Object byte[] 44100

# WAV header
[System.Text.Encoding]::ASCII.GetBytes('RIFF').CopyTo($wavHeader, 0)
[System.BitConverter]::GetBytes([int]($wavData.Length + 36)).CopyTo($wavHeader, 4)
[System.Text.Encoding]::ASCII.GetBytes('WAVE').CopyTo($wavHeader, 8)
[System.Text.Encoding]::ASCII.GetBytes('fmt ').CopyTo($wavHeader, 12)
[System.BitConverter]::GetBytes([int]16).CopyTo($wavHeader, 16)
[System.BitConverter]::GetBytes([short]1).CopyTo($wavHeader, 20)
[System.BitConverter]::GetBytes([short]1).CopyTo($wavHeader, 22)
[System.BitConverter]::GetBytes([int]44100).CopyTo($wavHeader, 24)
[System.BitConverter]::GetBytes([int]88200).CopyTo($wavHeader, 28)
[System.BitConverter]::GetBytes([short]2).CopyTo($wavHeader, 32)
[System.BitConverter]::GetBytes([short]16).CopyTo($wavHeader, 34)
[System.Text.Encoding]::ASCII.GetBytes('data').CopyTo($wavHeader, 36)
[System.BitConverter]::GetBytes([int]$wavData.Length).CopyTo($wavHeader, 40)

[System.IO.File]::WriteAllBytes('test-voice.wav', $wavHeader + $wavData)
"

echo.
echo Test WAV file created: test-voice.wav

echo.
echo Testing ElevenLabs API...
curl -X POST "https://api.elevenlabs.io/v1/voices/add" ^
  -H "xi-api-key: sk_0a708403cd51b255b857e964b73da3607a042faea7802e95" ^
  -F "name=CurlTestVoice" ^
  -F "files=@test-voice.wav" ^
  -F "description=Test voice from curl" ^
  -F "remove_background_noise=true" ^
  --verbose

echo.
echo Cleaning up...
del test-voice.wav

echo.
echo Test completed!
pause