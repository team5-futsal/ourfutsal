import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

/** 팀 편성 추가 **/
router.post("/team/add/", async (req, res, next) => {});

/** 팀 편성 제외 **/
router.put("/team/exclude", async (req, res, next) => {});

/** 팀 편성 비우기 **/
router.put("/team/empty", async (req, res, next) => {});

/** 팀 편성 조회**/
router.get("/team/find/:team", async (req, res, next) => {});

// 교체 선수 계획-- 추후 상의 //

export default router;
