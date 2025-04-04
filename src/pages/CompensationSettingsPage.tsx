import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CompensationSettingsPage = () => {
  const [doctorRate, setDoctorRate] = useState<number>(1000);
  const [therapistRate, setTherapistRate] = useState<number>(500);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("settings").select("*");
      if (!error && data) {
        for (const setting of data) {
          if (setting.key === "doctor_rate") setDoctorRate(Number(setting.value));
          if (setting.key === "therapist_rate") setTherapistRate(Number(setting.value));
          if (setting.key === "commission_rate") setCommissionRate(Number(setting.value));
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const payload = [
      { key: "doctor_rate", value: doctorRate },
      { key: "therapist_rate", value: therapistRate },
      { key: "commission_rate", value: commissionRate },
    ];

    const { error } = await supabase.from("settings").upsert(payload);
    if (error) {
      alert("❌ เกิดข้อผิดพลาดในการบันทึก");
      console.error(error);
    } else {
      alert("✅ บันทึกอัตราค่าตอบแทนเรียบร้อยแล้ว");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">⚙️ การตั้งค่าค่าตอบแทน</h1>

      {loading ? (
        <p className="text-gray-500">⏳ กำลังโหลดข้อมูล...</p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block mb-1">💉 ค่าตอบแทนแพทย์ (บาท/ชั่วโมง)</label>
            <input
              type="number"
              value={doctorRate}
              onChange={(e) => setDoctorRate(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">💆‍♀️ ค่าตอบแทน Therapist (บาท/ชั่วโมง)</label>
            <input
              type="number"
              value={therapistRate}
              onChange={(e) => setTherapistRate(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">💰 ค่าคอมมิชชั่น Ambassador (%)</label>
            <input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            💾 บันทึกการตั้งค่า
          </button>
        </div>
      )}
    </div>
  );
};

export default CompensationSettingsPage; 