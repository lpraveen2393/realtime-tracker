document.addEventListener("DOMContentLoaded", function () {
    const socket = io();
    console.log("hey");

    const map = L.map("map").setView([0, 0], 2); // Initial view

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap",
    }).addTo(map);

    const markers = {};

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                socket.emit("send-location", { latitude, longitude });

                // Set map view to user's location
                map.setView([latitude, longitude], 20);

                if (!markers["user"]) {
                    markers["user"] = L.marker([latitude, longitude]).addTo(map);
                } else {
                    markers["user"].setLatLng([latitude, longitude]);
                }
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );
    }

    socket.on("receive-location", (data) => {
        const { id, latitude, longitude } = data;

        map.setView([latitude, longitude], 20);

        if (markers[id]) {
            markers[id].setLatLng([latitude, longitude]);
        } else {
            markers[id] = L.marker([latitude, longitude]).addTo(map);
        }
    });

    socket.on("disconnected", (id) => {
        if (markers[id]) {
            map.removeLayer(markers[id]);
            delete markers[id];
        }
    });

    window.addEventListener("beforeunload", () => {
        socket.emit("user-disconnect");
    });
});
