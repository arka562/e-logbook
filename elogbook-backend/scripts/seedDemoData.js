import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import Plant from "../models/Plant.model.js";
import Department from "../models/Department.model.js";
import Unit from "../models/Unit.model.js";
import Shift from "../models/Shift.model.js";
import ParameterTemplate from "../models/ParameterTemplate.model.js";
import ParameterEntry from "../models/ParameterEntry.mode.js";
import EventLog from "../models/EventLog.model.js";
import Issue from "../models/Issue.model.js";
import AuditLog from "../models/AuditLog.model.js";

dotenv.config();

const PASSWORD = "Password@123";
const shouldReset = process.argv.includes("--reset-demo");

const demoPlants = [
  { name: "Demo Thermal Plant A", location: "Durgapur" },
  { name: "Demo Thermal Plant B", location: "Korba" },
  { name: "Demo Hydro Plant C", location: "Rishikesh" },
];

const departmentNames = ["Operations", "Electrical", "Mechanical", "Safety"];
const shiftTypes = ["A", "B", "C"];
const issueStatuses = ["open", "wip", "closed"];
const priorities = ["low", "medium", "high", "critical"];

const demoUsers = [
  { name: "Demo Admin", email: "demo.admin@adanipower.test", role: "admin", department: "Operations" },
  { name: "Demo HOD", email: "demo.hod@adanipower.test", role: "hod", department: "Operations" },
  { name: "Demo Shift Incharge", email: "demo.incharge@adanipower.test", role: "shift_incharge", department: "Operations" },
  { name: "Demo Operator One", email: "demo.operator1@adanipower.test", role: "operator", department: "Operations" },
  { name: "Demo Operator Two", email: "demo.operator2@adanipower.test", role: "operator", department: "Electrical" },
];

const parameterSeeds = [
  { name: "Boiler Pressure", category: "shift_parameters", unit: "kg/cm2", designValue: "150", minValue: 130, maxValue: 170 },
  { name: "Main Steam Temperature", category: "shift_parameters", unit: "C", designValue: "540", minValue: 515, maxValue: 565 },
  { name: "Turbine Load", category: "shift_parameters", unit: "MW", designValue: "250", minValue: 180, maxValue: 260 },
  { name: "Generator Voltage", category: "electrical", unit: "kV", designValue: "11", minValue: 10.5, maxValue: 11.5 },
  { name: "Generator Frequency", category: "electrical", unit: "Hz", designValue: "50", minValue: 49.5, maxValue: 50.5 },
  { name: "Transformer Oil Temp", category: "electrical", unit: "C", designValue: "65", minValue: 35, maxValue: 85 },
  { name: "Bus Coupler Status", category: "switchyard", unit: "status", designValue: "closed" },
  { name: "Yard Breaker Pressure", category: "switchyard", unit: "bar", designValue: "7", minValue: 5.5, maxValue: 8.5 },
  { name: "Fire Pump Pressure", category: "fire_system", unit: "bar", designValue: "8", minValue: 6, maxValue: 10 },
  { name: "Hydrant Header Pressure", category: "fire_system", unit: "bar", designValue: "7", minValue: 5, maxValue: 9 },
  { name: "Coal Mill Status", category: "equipment_status", unit: "status", designValue: "running" },
  { name: "Cooling Tower Fan", category: "equipment_status", unit: "status", designValue: "running" },
];

const eventTexts = [
  "Shift takeover completed and plant status reviewed.",
  "Routine field round completed by operator.",
  "Load adjusted as per grid demand.",
  "Auxiliary equipment inspection completed.",
  "Control room readings verified with field readings.",
  "Safety toolbox briefing completed.",
  "Minor vibration observed and kept under watch.",
  "Standby pump trial completed successfully.",
];

const issueTexts = [
  "Oil leakage observed near pump seal.",
  "Abnormal vibration reported from auxiliary motor.",
  "Temperature trend above normal operating range.",
  "Breaker indication mismatch in control panel.",
  "Cooling water flow found low during round.",
  "Fire hydrant valve hard to operate.",
  "Local gauge reading fluctuating intermittently.",
  "Equipment noise higher than usual.",
];

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for demo seed");
};

const pick = (items, index) => items[index % items.length];

const daysAgo = (days, shiftIndex = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(6 + shiftIndex * 8, 0, 0, 0);
  return date;
};

const createUsers = async () => {
  const users = [];

  for (const user of demoUsers) {
    let doc = await User.findOne({ email: user.email });

    if (!doc) {
      doc = await User.create({ ...user, password: PASSWORD });
    } else {
      doc.name = user.name;
      doc.role = user.role;
      doc.department = user.department;
      await doc.save();
    }

    users.push(doc);
  }

  return {
    admin: users.find((user) => user.role === "admin"),
    hod: users.find((user) => user.role === "hod"),
    incharge: users.find((user) => user.role === "shift_incharge"),
    operators: users.filter((user) => user.role === "operator"),
    all: users,
  };
};

const resetDemoData = async () => {
  const plants = await Plant.find({ name: { $in: demoPlants.map((plant) => plant.name) } });
  const plantIds = plants.map((plant) => plant._id);
  const shifts = await Shift.find({ plant: { $in: plantIds } }).select("_id");
  const shiftIds = shifts.map((shift) => shift._id);
  const users = await User.find({ email: { $in: demoUsers.map((user) => user.email) } }).select("_id");
  const userIds = users.map((user) => user._id);

  await Promise.all([
    ParameterEntry.deleteMany({ shiftId: { $in: shiftIds } }),
    EventLog.deleteMany({ shift: { $in: shiftIds } }),
    Issue.deleteMany({ shift: { $in: shiftIds } }),
    AuditLog.deleteMany({
      $or: [
        { entityId: { $in: shiftIds } },
        { user: { $in: userIds } },
      ],
    }),
    Shift.deleteMany({ _id: { $in: shiftIds } }),
    ParameterTemplate.deleteMany({ plant: { $in: plantIds } }),
    Unit.deleteMany({ plant: { $in: plantIds } }),
    Department.deleteMany({ plant: { $in: plantIds } }),
    Plant.deleteMany({ _id: { $in: plantIds } }),
    User.deleteMany({ _id: { $in: userIds } }),
  ]);
};

const createPlantStructure = async () => {
  const result = [];

  for (const plantSeed of demoPlants) {
    const plant = await Plant.create(plantSeed);
    const departments = [];

    for (const name of departmentNames) {
      departments.push(await Department.create({ name, plant: plant._id }));
    }

    const operationsDept = departments.find((dept) => dept.name === "Operations");
    const units = [];

    for (let index = 1; index <= 3; index += 1) {
      units.push(
        await Unit.create({
          name: `${plant.name.split(" ").slice(-1)[0]} Unit ${index}`,
          plant: plant._id,
          department: operationsDept._id,
          capacity: 210 + index * 40,
        })
      );
    }

    const templates = [];
    for (const parameter of parameterSeeds) {
      templates.push(
        await ParameterTemplate.create({
          ...parameter,
          plant: plant._id,
        })
      );
    }

    result.push({ plant, departments, units, templates });
  }

  return result;
};

const createAuditLog = async ({ action, module, entityId, user, description }) => {
  await AuditLog.create({
    action,
    module,
    entityId,
    user: user._id,
    userRole: user.role,
    description,
    ipAddress: "127.0.0.1",
  });
};

const createOperationalData = async (structures, users) => {
  let shiftCount = 0;
  let entryCount = 0;
  let eventCount = 0;
  let issueCount = 0;

  for (let day = 0; day < 14; day += 1) {
    for (const structure of structures) {
      for (const [unitIndex, unit] of structure.units.entries()) {
        const shiftType = pick(shiftTypes, day + unitIndex);
        const status =
          day < 2 ? "submitted" : day < 4 ? "approved" : day < 11 ? "locked" : "draft";
        const shiftDate = daysAgo(day, shiftTypes.indexOf(shiftType));

        const shift = await Shift.create({
          date: shiftDate,
          shiftType,
          plant: structure.plant._id,
          unit: unit._id,
          shiftInCharge: users.incharge._id,
          engineers: [
            { name: "Demo Field Engineer", role: "Mechanical" },
            { name: "Demo Desk Engineer", role: "Electrical" },
          ],
          status,
          submittedBy: status !== "draft" ? users.operators[0]._id : undefined,
          submittedAt: status !== "draft" ? shiftDate : undefined,
          approvedBy: ["approved", "locked"].includes(status) ? users.incharge._id : undefined,
          approvedAt: ["approved", "locked"].includes(status) ? shiftDate : undefined,
          lockedBy: status === "locked" ? users.hod._id : undefined,
          lockedAt: status === "locked" ? shiftDate : undefined,
          handoverRemarks:
            day % 5 === 0
              ? ""
              : `Demo handover for ${unit.name}: monitor auxiliaries, review open issues, and verify next shift load plan.`,
        });

        shiftCount += 1;

        await createAuditLog({
          action: "CREATE",
          module: "SHIFT",
          entityId: shift._id,
          user: users.operators[0],
          description: `Demo shift ${shift.shiftType} created`,
        });

        if (status !== "draft") {
          await createAuditLog({
            action: "SUBMIT",
            module: "SHIFT",
            entityId: shift._id,
            user: users.operators[0],
            description: "Demo shift submitted",
          });
        }

        if (["approved", "locked"].includes(status)) {
          await createAuditLog({
            action: "APPROVE",
            module: "SHIFT",
            entityId: shift._id,
            user: users.incharge,
            description: "Demo shift approved",
          });
        }

        if (status === "locked") {
          await createAuditLog({
            action: "LOCK",
            module: "SHIFT",
            entityId: shift._id,
            user: users.hod,
            description: "Demo shift locked",
          });
        }

        for (const [parameterIndex, template] of structure.templates.entries()) {
          const base = Number(template.designValue);
          const hasNumericDesign = !Number.isNaN(base);
          const variance = ((day + parameterIndex + unitIndex) % 7) - 3;
          const unit1Value = hasNumericDesign
            ? String(base + variance * 3)
            : pick(["running", "standby", "closed", "open"], day + parameterIndex);
          const unit2Value = hasNumericDesign
            ? String(base + variance * 2)
            : pick(["running", "available", "closed", "trip"], day + parameterIndex + 1);

          await ParameterEntry.create({
            shiftId: shift._id,
            parameterId: template._id,
            unit1Value,
            unit2Value,
          });
          entryCount += 1;
        }

        const eventTotal = 2 + ((day + unitIndex) % 3);
        for (let eventIndex = 0; eventIndex < eventTotal; eventIndex += 1) {
          await EventLog.create({
            shift: shift._id,
            unit: unit._id,
            description: pick(eventTexts, day + unitIndex + eventIndex),
            createdBy: pick(users.operators, eventIndex)._id,
            createdAt: shiftDate,
            updatedAt: shiftDate,
          });
          eventCount += 1;
        }

        const issueTotal = (day + unitIndex) % 3;
        for (let issueIndex = 0; issueIndex < issueTotal; issueIndex += 1) {
          const issueStatus = pick(issueStatuses, day + issueIndex);
          const priority = pick(priorities, day + unitIndex + issueIndex);
          const department = pick(structure.departments, issueIndex + unitIndex);

          await Issue.create({
            shift: shift._id,
            unit: unit._id,
            department: department._id,
            equipment: pick(["Boiler Feed Pump", "Generator", "Transformer", "Coal Mill", "Fire Pump"], issueIndex + day),
            description: pick(issueTexts, issueIndex + day + unitIndex),
            priority,
            status: issueStatus,
            createdBy: pick(users.operators, issueIndex)._id,
            resolvedBy: issueStatus === "closed" ? users.hod._id : undefined,
            resolvedAt: issueStatus === "closed" ? shiftDate : undefined,
            closureRemarks:
              issueStatus === "closed"
                ? "Demo closure: issue verified, corrective action completed, and equipment normalized."
                : undefined,
            createdAt: shiftDate,
            updatedAt: shiftDate,
          });
          issueCount += 1;
        }
      }
    }
  }

  return { shiftCount, entryCount, eventCount, issueCount };
};

const main = async () => {
  await connect();

  if (shouldReset) {
    console.log("Resetting existing demo data...");
    await resetDemoData();
  }

  const existingPlant = await Plant.findOne({ name: demoPlants[0].name });
  if (existingPlant && !shouldReset) {
    console.log("Demo data already exists. Run `npm run seed:demo -- --reset-demo` to recreate it.");
    await mongoose.disconnect();
    return;
  }

  const users = await createUsers();
  const structures = await createPlantStructure();
  const counts = await createOperationalData(structures, users);

  console.log("Demo seed complete");
  console.log(`Plants: ${structures.length}`);
  console.log(`Departments: ${structures.length * departmentNames.length}`);
  console.log(`Units: ${structures.reduce((total, item) => total + item.units.length, 0)}`);
  console.log(`Users: ${users.all.length}`);
  console.log(`Parameter templates: ${structures.reduce((total, item) => total + item.templates.length, 0)}`);
  console.log(`Shifts: ${counts.shiftCount}`);
  console.log(`Parameter entries: ${counts.entryCount}`);
  console.log(`Events: ${counts.eventCount}`);
  console.log(`Issues: ${counts.issueCount}`);
  console.log("");
  console.log("Login accounts, password for all: Password@123");
  for (const user of demoUsers) {
    console.log(`${user.role}: ${user.email}`);
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Demo seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
