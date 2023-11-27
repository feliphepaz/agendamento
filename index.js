const express = require("express");
const app = express();
const mongoose = require("mongoose");
const appointmentService = require("./services/AppointmentService");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/agendamento");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/agendamentos", async (req, res) => {
  try {
    const appointments = await appointmentService.GetAll(true);
    res.render("list", { appointments });
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.get("/agendamento", (req, res) => {
  res.render("create");
});

app.get("/agendamento/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await appointmentService.GetOne(id);
    res.render("appointment", { appointment });
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.get("/appointments", async (req, res) => {
  try {
    const appointments = await appointmentService.GetAll(false);
    res.json(appointments);
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.get("/search", async (req, res) => {
  const { search } = req.query;
  try {
    const appointments = await appointmentService.Search(search);
    res.render("list", { appointments });
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.post("/create", async (req, res) => {
  const { name, email, cpf, description, date, hour } = req.body;
  try {
    await appointmentService.Create(name, email, cpf, description, date, hour);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.post("/finish", async (req, res) => {
  const { id } = req.body;
  try {
    await appointmentService.Finish(id);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await appointmentService.Delete(id);
    res.send("Agendamento deletado");
  } catch (err) {
    console.log(err);
    res.send("Ocorreu algum erro");
  }
});

const pollingTime = 1000 * 60 * 5;

setInterval(async () => {
  try {
    await appointmentService.SendNotification();
  } catch (err) {
    console.log(err);
  }
}, pollingTime);

app.listen(8989, () => {
  console.log("Servidor rodando!");
});
