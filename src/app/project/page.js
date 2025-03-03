import DynamicForm from "@/components/forms/projectInfo/DynamicForm";

export default function Project() {

    return (
        <>
            <h1>DynamicForm!</h1>
            <DynamicForm uri="./dynaFormDemo.json" />
        </>
    )

}