import { Router } from "express";
import JobModel from "../models/job.model.js";
import authentication from "../middlewares/authentication.js";

const jobsRouter = Router();

// get all jobs
jobsRouter.get("/all", authentication, async (req, res) => {
  try {
    const jobs = await JobModel.find({ userId: req.userId });
    return res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// add job
jobsRouter.post("/add", authentication, async (req, res) => {
  try {
    const jobData = { ...req.body, userId: req.userId };
    const newJob = new JobModel(jobData);
    await newJob.save();
    return res
      .status(201)
      .json({ message: "Job added successfully", job: newJob });
  } catch (error) {
    console.error("Error adding job:", error);
    res.status(500).json({ message: "Error adding job", error: error.message });
  }
});

// delete job
jobsRouter.delete("/delete/:id", authentication, async (req, res) => {
  try {
    const jobId = req.params.id;

    const deletedJob = await JobModel.findOneAndDelete({
      _id: jobId,
      userId: req.userId, // Only allow deleting own job
    });

    if (!deletedJob) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Error deleting job", error: error.message });
  }
});

// edit job
jobsRouter.put("/edit/:id", authentication, async (req, res) => {
  try {
    const jobId = req.params.id;
    const updates = req.body;

    const updatedJob = await JobModel.findOneAndUpdate(
      { _id: jobId, userId: req.userId }, // Only allow editing own job
      updates,
      { new: true } // Return the updated document
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    res.status(200).json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ message: "Error updating job", error: error.message });
  }
});

export default jobsRouter;
