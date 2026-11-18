cd "$(dirname "$0")"  # Kivalu.glb wird in load.py erwartet
for a in idle run jump fall flutter fly fire hurt cheer climb; do OUT=. node serve.js sheet.html "{\"only\":[\"$a\"]}" 2>&1 | grep -i 'err'; cp frames/meta.json meta/$a.json; done
for h in krone zauberhut piratenhut wikingerhelm blumenkranz fliegerbrille schal; do for a in idle run jump fall flutter fly fire hurt cheer climb; do OUT=. node serve.js sheet.html "{\"only\":[\"$a\"],\"hat\":\"$h\"}" 2>&1 | grep -i 'err'; done; done
echo ALLDONE
