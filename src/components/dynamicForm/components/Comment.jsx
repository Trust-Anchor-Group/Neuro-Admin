export default function Comment({element}) {
    return (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4" role="alert">
            <span className="font-bold">Feedback:</span>
            <p>{element.comment}</p>
        </div>
    )
}