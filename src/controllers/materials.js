import materialsService from "../services/materials.js"


class MaterialsController{
    async getAllMaterials (req,res,next){
        let resData=await materialsService.getAllMaterials(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
    async createMaterials (req,res,next){
        let resData=await materialsService.createMaterials(req,next)

        if(resData){
            return res.status(resData.status).json(resData)
        }
    }
}

const materialsController=new MaterialsController()
export default materialsController 