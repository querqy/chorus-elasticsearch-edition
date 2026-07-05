import { useStore } from "../../store/useStore";

export default function Sidebar() {
  const {
    selectedAlgo,
    setAlgo,
    selectedSubConfig,
    setSubConfig,
    typeAggs,
    selectedTypes,
    toggleType,
  } = useStore();

  return (
    <div className="flex flex-col gap-6 w-full pr-2 select-none">
      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-sm text-gray-800">Pick your Algo</h3>
        <select
          value={selectedAlgo}
          onChange={(e) => setAlgo(e.target.value)}
          className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
        >
          <option value="default">Keyword</option>
          <option value="neural">Neural</option>
          <option value="hybrid">Hybrid</option>
          <option value="ab">AB</option>
          <option value="art_controlled">ART Controlled</option>
          <option value="other_config">Other Config</option>
        </select>
      </div>

      {selectedAlgo === "other_config" && (
        <div className="flex flex-col gap-2 pl-2 border-l-2 border-blue-500 animate-fadeIn">
          <h4 className="text-xs font-semibold text-gray-600">
            Select Configuration:
          </h4>
          <select
            value={selectedSubConfig}
            onChange={(e) => setSubConfig(e.target.value)}
            className="border border-gray-300 rounded p-1 text-sm bg-white w-full"
          >
            <option value="">-- Select a configuration --</option>
            <option value="art_controlled">art_controlled</option>
            <option value="baseline">baseline</option>
            <option value="baseline_title_weight">
              baseline with title weight
            </option>
            <option value="hybrid_search_query">hybrid_search_query</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-bold text-sm text-gray-800">
          Filter by Product Types
        </h3>
        <div className="flex flex-col pr-1 max-h-96 overflow-y-auto border border-transparent custom-scrollbar">
          {typeAggs && typeAggs.length > 0 ? (
            typeAggs.map((bucket) => (
              <label
                key={bucket.key}
                className="flex items-center justify-between w-full text-sm text-gray-700 cursor-pointer py-1 hover:bg-gray-50 rounded"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-0"
                    checked={selectedTypes?.includes(bucket.key) || false}
                    onChange={() => toggleType(bucket.key)}
                  />
                  <span className="truncate max-w-[160px]" title={bucket.key}>
                    {bucket.key}
                  </span>
                </div>
                <span className="text-gray-400 text-right pr-1 text-xs">
                  {bucket.doc_count}
                </span>
              </label>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic">
              No filters available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
