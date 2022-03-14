const { application } = require("express");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const connect = () => {
  return mongoose.connect(
    "mongodb://127.0.0.1:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
  );
};

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, default: "Female" },
    type: { type: String, default: "customer" },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);

const branchDetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    IFSC: { type: String, required: true },
    MICR: { type: Number, required: true },
    masterAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "masterAccount",
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const BranchDetail = mongoose.model("branchDetail", branchDetailSchema);

const masterAccountSchema = new mongoose.Schema(
  {
    balance: { type: Number, required: true },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    savingAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "savingAccount",
      required: true,
    },
    fixedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fixedAccount",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const MasterAccount = mongoose.model("masterAccount", masterAccountSchema);

const savingAccountSchema = new mongoose.Schema(
  {
    accountNumber: { type: Number, required: true, unique: true },
    balance: { type: Number, required: true },
    interestRate: { type: Number, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const SavingAccount = mongoose.model("savingAccount", savingAccountSchema);

const fixedAccountSchema = new mongoose.Schema(
  {
    accountNumber: { type: Number, required: true, unique: true },
    balance: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    startDate: { type: String, required: true },
    maturityDate: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const FixedAccount = mongoose.model("fixedAccount", fixedAccountSchema);

// Crud operations
// 1) to get all the master account details:
app.get("/masterAccount", async (req, res) => {
  try {
    const masterAccount = await MasterAccount.find({}).lean().exec();
    return res.status(200).send(masterAccount);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message });
  }
});

// 2) post API to create a saving account ;

app.post("/savingAccount", async (req, res) => {
  try {
    const savingAccount = await SavingAccount.create(req.body);
    return res.status(201).send(savingAccount);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// 3) post API to create a fixed account

app.post("/fixedAccount", async (req, res) => {
  try {
    const fixedAccount = await FixedAccount.create(req.body);
    return res.status(201).send(fixedAccount);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// 4) get API by masterID and show balance and user

app.get("/masterAccount/:id", async (req, res) => {
  try {
    const masterAccount = await MasterAccount.findById(req.params.id)
      .populate({
        userID: { accountNumber: 1, balance: 1 },
      })
      .lean()
      .exec();
    return res.status(200).send(masterAccount);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

// api deletion

app.delete("/fixedAccount/:id", async (req, res) => {
  try {
    const fixedAccount = await FixedAccount.findByIdAndRemove(req.params.id);

    return res.status(200).send(fixedAccount);
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

app.listen(4002, async () => {
  try {
    await connect();
    console.log("listenning on port 4002");
  } catch (error) {
    console.log(error);
  }
});
