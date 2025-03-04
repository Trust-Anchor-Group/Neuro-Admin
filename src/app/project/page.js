import DynamicForm from "@/components/forms/projectInfo/DynamicForm";
import Image from "next/image";
import logo from '../../../public/neuroAdminLogo.svg'

export default function Project() {

    return (
        <>
        <div className="bg-neuroGoldLight pb-10">
            <div className="flex p-10 ">
                <p className="text-5xl text-black font-bold">Neru</p>
                <div className="w-12 h-12">
                    <Image
                    src={logo}
                    width={1200}
                    height={1200}
                    alt="Neruo logo"/>
                </div>
            </div>
            <div className="grid grid-cols-2 h-screen items-center">
                <div>
                    <h1 className="text-center text-xl font-semibold">Register Your Business for Seamless E-Transactions</h1>
                </div>
                <div className="border-2 p-10 mr-[14%] bg-backgroundLight rounded-lg">
                <DynamicForm uri="./dynaFormDemo.json" />
                </div>
            </div>
        </div>
        </>
    )

}