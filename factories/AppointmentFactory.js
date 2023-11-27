class AppointmentFactory {
  Build(raw) {
    const day = raw.date.getDate() + 1;
    const month = raw.date.getMonth();
    const year = raw.date.getFullYear();

    const hour = +raw.hour.split(":")[0];
    const minutes = +raw.hour.split(":")[1];

    const newDate = new Date(year, month, day, hour, minutes, 0, 0);

    const built = {
      id: raw.id,
      title: raw.name + " - " + raw.description,
      start: newDate,
      end: newDate,
      email: raw.email,
      notified: raw.notified,
    };

    return built;
  }
}

module.exports = new AppointmentFactory();
