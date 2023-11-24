import { db } from "$lib/firebase/firebase.client";
import { getDocs, collection } from "firebase/firestore";

export const load = async ({ fetch }) => {
  const fetchScenarios = async () => {
    const scenariosQuerry = await getDocs(
      collection(db, "scenarios")
    );
    let globalScenarios = [];
    scenariosQuerry.forEach((doc) => {
      globalScenarios.push(doc.data());
    });
    return globalScenarios;
  }
  return {
    scenarios: fetchScenarios()
  };
};
