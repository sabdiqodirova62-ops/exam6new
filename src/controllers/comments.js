import commentsService from "../services/comments.js";

class CommentsController {
  async getAllComments(req, res, next) {
    let resData = await commentsService.getAllComments(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async createComment(req, res, next) {
    let resData = await commentsService.createComment(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async updateComment(req, res, next) {
    let resData = await commentsService.updateComment(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }

  async deleteComment(req, res, next) {
    let resData = await commentsService.deleteComment(req, next);
    if (resData) {
      return res.status(resData.status).json(resData);
    }
  }
}

const commentsController = new CommentsController();
export default commentsController;
