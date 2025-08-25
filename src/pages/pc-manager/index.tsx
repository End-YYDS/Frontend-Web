import { PCManagerContent } from "./Content";

export const meta = { requiresAuth: false };

const index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1">
        <PCManagerContent />
      </div>
    </div>
  )
}

export default index
