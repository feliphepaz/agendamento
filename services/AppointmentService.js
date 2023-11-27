require("dotenv").config({ path: ".env.local" });
const appointment = require("../models/Appointment");
const mongoose = require("mongoose");
const AppointmentFactory = require("../factories/AppointmentFactory");
const mailer = require("nodemailer");

const Appointment = mongoose.model("appointment", appointment);

class AppointmentService {
  async GetAll(showFinished) {
    try {
      if (showFinished) {
        return await Appointment.find();
      } else {
        const appointments = await Appointment.find({ finished: false });
        const newAppointments = [];

        appointments.forEach((appointment) => {
          if (appointment.date && appointment.hour) {
            newAppointments.push(AppointmentFactory.Build(appointment));
          }
        });

        return newAppointments;
      }
    } catch (err) {
      console.log(err);
    }
  }

  async GetOne(id) {
    try {
      return await Appointment.findOne({ _id: id });
    } catch (err) {
      console.log(err);
    }
  }

  async Search(query) {
    try {
      return await Appointment.find().or([{ email: query }, { cpf: query }]);
    } catch (err) {
      console.log(err);
    }
  }

  async Create(name, email, cpf, description, date, hour) {
    const newAppointment = new Appointment({
      name,
      email,
      cpf,
      description,
      date,
      hour,
      finished: false,
      notified: false,
    });

    try {
      await newAppointment.save();
    } catch (err) {
      console.log(err);
    }
  }

  async Finish(id) {
    try {
      await Appointment.findByIdAndUpdate(id, {
        finished: true,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async Notify(id) {
    try {
      await Appointment.findByIdAndUpdate(id, {
        notified: true,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async Delete(id) {
    try {
      await Appointment.findByIdAndDelete(id);
    } catch (err) {
      console.log(err);
    }
  }

  async SendNotification() {
    const transporter = mailer.createTransport({
      host: process.env.TP_HOST,
      port: process.env.TP_PORT,
      auth: {
        user: process.env.TP_USER,
        pass: process.env.TP_PASS,
      },
    });

    try {
      const appointments = await this.GetAll(false);
      appointments.forEach((appointment) => {
        const date = appointment.start.getTime();
        const hour = 1000 * 60 * 60;
        const diff = date - Date.now();

        if (diff <= hour) {
          if (!appointment.notified) {
            transporter
              .sendMail({
                from: "Feliphe Paz <feliphe@teste.com.br>",
                to: appointment.email,
                subject: "Sua consulta vai acontecer em breve!",
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu dui dolor.",
              })
              .then(async () => {
                await this.Notify(appointment.id);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = new AppointmentService();
