import DynamicForm from "@/components/dynamicForm/DynamicForm";

export default function Project() {

    return (
        <div className="flex justify-center">
            <div className="p-10">
                <DynamicForm uri="./dynaFormDemo.json" />
            </div>

        </div>
    )

}