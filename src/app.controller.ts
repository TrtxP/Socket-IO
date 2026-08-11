import { Controller, Get, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { readFile } from "fs/promises";
import { join } from "path";

@Controller()
export class AppController {
  @Get()
  async getIndex(@Res() res: FastifyReply) {
    const path = join(__dirname, "main", "main.html");
    const html = await readFile(path, "utf8");
    res.type("text/html").send(html);
  }

  @Get("/register")
  async getRegister(@Res() res: FastifyReply) {
    const path = join(__dirname, "register", "register.html");
    const html = await readFile(path, "utf8");
    res.type("text/html").send(html);
  }

  @Get("/login")
  async getLogin(@Res() res: FastifyReply) {
    const path = join(__dirname, "login", "login.html");
    const html = await readFile(path, "utf8");
    res.type("text/html").send(html);
  }

  @Get("/logout")
  async logout(@Res() res: FastifyReply) {
    res.clearCookie("token", { path: '/' });
    const path = join(__dirname, "logout", "logout.html");
    const html = await readFile(path, "utf8");
    res.type("text/html").send(html);
  }

  @Get("/reset-password")
  async getResetPassword(@Res() res: FastifyReply) {
    const path = join(__dirname, "reset-password", "reset-password.html");
    const html = await readFile(path, "utf8");
    res.type("text/html").send(html);
  }
}
