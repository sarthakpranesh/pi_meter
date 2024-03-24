docker run -d \
  -v /sys/devices/system/cpu/cpu0/cpufreq:/pi_host/sys/devices/system/cpu/cpu0/cpufreq:ro \
  -v /sys/class/thermal/thermal_zone0:/pi_host/sys/class/thermal/thermal_zone0:ro \
  -v /sys/devices/platform:/pi_host/sys/devices/platform:ro \
  -v /etc/os-release:/pi_host/etc/os-release:ro \
  -v /proc/cpuinfo:/pi_host/proc/cpuinfo:ro \
  -p 8004:8004 \
  -p 8011:8011 \
  --restart "unless-stopped" \
  --name pi_meter \
  sarthakpranesh/pi_meter