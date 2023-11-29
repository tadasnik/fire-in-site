import numpy as np
import matplotlib.pyplot as plt

# range of Heat per Unit Area values in Kj/m2
x = np.linspace(0, 30000, 1000)
# range of ROS values in m/min
y = np.linspace(0, 60, 1000)
xv, yv = np.meshgrid(x, y)

# fireline intensity based on Albini 1976a
fi = (xv / 11.357) * (yv * 3.281)
# Byram's flame length in feet
fl = 0.45 * (fi / 60) ** 0.46

flm = fl * 0.3048
colors = ["white", "#FFF1EE", "#FFE4DE", "#FFD5CC", "#FFBCAD", "#FE795D"]

colors_gray = ["0.98", "0.9", "0.8", "0.7", "0.6", "0.5"]

flm_thresholds = [-1, 0.5, 1.5, 3.5, 5, 8, 10]
fig, ax = plt.subplots(1, 1, figsize=(10, 10))
ax.contour(xv, yv, flm, flm_thresholds, colors="0.5", linewidths=0.1)
ax.contourf(xv, yv, flm, flm_thresholds, zorder=-1, colors=colors)
fig.subplots_adjust(left=0, right=1, bottom=0, top=1.0)
ax.set_axis_off()
# ax.axis("tight")
# ax.axis("off")
plt.gca().set_position([0, 0, 1, 1])
plt.savefig("../../assets/fire_char_backg.svg")
# plt.savefig("../../assets/fire_char_backg.png", dpi=300, bbox_inches="tight")
plt.show()
